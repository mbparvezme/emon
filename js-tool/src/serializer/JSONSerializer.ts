import { EmonSchema, EmonType, EmonField, EmonDataRecord } from "../types";
import { splitTopLevel, unquote, isTripleQuoted } from "../utils";

// --- SCHEMA PARSING ---

/**
 * Parses a single EMON type definition line (#name(f:t,...)[]) into an EmonType object.
 * @param line The EMON schema line.
 * @returns The parsed EmonType object.
 */
const parseTypeDefinition = (line: string): EmonType => {
    // #name(field:type,field2:type2)[]
    const match = line.match(/^#([A-Za-z_]\w*)(\((.*)\))?(\[\])?$/);
    if (!match) throw new Error(`Invalid type definition syntax: ${line}`);

    const [, name, , fieldsStr, isArray] = match;

    // Fields string is split by comma, ignoring potential inline type definitions 
    // (though inline types are currently not supported in the schema generator flow, we parse them minimally).
    const fields: EmonField[] = fieldsStr
        ? fieldsStr.split(',').map(f => f.trim()).filter(Boolean).map(f => {
            const [name, type] = f.split(':').map(x => x.trim());
            if (!name || !type) throw new Error(`Invalid field definition in type ${name}: ${f}`);
            return { name, type };
        })
        : [];

    return { name, fields, isArray: !!isArray };
};


// --- PRIMITIVE PARSING ---

/**
 * Parses a raw EMON string segment into a primitive JS value based on the declared type.
 * @param val The raw EMON string segment.
 * @param type The expected EMON type ('string', 'number', 'bool', etc.).
 * @returns The parsed JavaScript value.
 */
const parsePrimitive = (val: string, type: string): any => {
    val = val.trim();
    if (val === 'null') return null;

    if (type === 'number') {
        const n = Number(val);
        // Rule 11: Strict Type Validation. If it cannot be parsed as a number, it's an error.
        if (Number.isNaN(n)) {
            // If the parser allowed an invalid number through (e.g., "12a"), it throws
            throw new Error(`Strict Type Error: Expected number for value "${val}"`);
        }
        return n;
    }

    if (type === 'bool' || type === 'boolean') {
        if (val === 'true') return true;
        if (val === 'false') return false;
        // Rule 11: Strict Type Validation. Any other value for bool is an error.
        throw new Error(`Strict Type Error: Expected bool (true/false) for value "${val}"`);
    }

    // String type: Handle unquoting, escaping, and multi-line (triple quotes)
    if (type === 'string') {
        // Unquote handles both double and triple quotes
        return unquote(val);
    }

    // Fallback if type is unknown or implicitly string/primitive
    return unquote(val);
};

// --- RECURSIVE VALUE PARSING ---

/**
 * Recursively parses an EMON value segment (primitive, array, or nested object).
 * @param fieldType The declared EMON type for the field.
 * @param value The raw EMON string segment for the value.
 * @param schemas The complete EMON schema map.
 * @returns The parsed JavaScript value (object, array, or primitive).
 */
const parseValueRecursive = (fieldType: string, value: string, schemas: EmonSchema): any => {
    value = value.trim();
    if (value === 'null' || value === '') return null; // Handle explicit 'null' keyword and implicit null segments (e.g., in =A,,C)

    // 1. Custom Type Reference (e.g., '#member')
    if (fieldType.startsWith('#')) {
        const typeName = fieldType.slice(1);
        // Rule 6: Nested objects are wrapped in {}
        if (!value.startsWith('{') || !value.endsWith('}')) {
            throw new Error(`Structure Error: Expected nested object {} for type ${typeName}, found ${value}`);
        }
        const inner = value.slice(1, -1).trim();
        return parseRecord(typeName, inner, schemas);
    }

    // 2. Array Type (e.g., '[string]', '[#member]')
    if (fieldType.startsWith('[') && fieldType.endsWith(']')) {
        const innerTypeRaw = fieldType.slice(1, -1).trim();

        // Rule 6: Arrays are wrapped in []
        if (!value.startsWith('[') || !value.endsWith(']')) {
            throw new Error(`Structure Error: Expected array [] for type ${fieldType}, found ${value}`);
        }
        const inner = value.slice(1, -1).trim();
        if (inner === '') return []; // Empty array

        const items = splitTopLevel(inner, ','); // Split top-level array elements

        // Rule 12: Arrays must be homogenous
        return items.map(it => parseValueRecursive(innerTypeRaw, it, schemas));
    }

    // 3. Primitive Type (e.g., 'string', 'number', 'bool')
    return parsePrimitive(value, fieldType);
};

/**
 * Parses a single EMON record string into a JavaScript object.
 * @param typeName The name of the schema type to use.
 * @param recordStr The comma-separated EMON record string.
 * @param schemas The complete EMON schema map.
 * @returns The parsed JavaScript object.
 */
const parseRecord = (typeName: string, recordStr: string, schemas: EmonSchema): EmonDataRecord => {
    const type = schemas[typeName];
    if (!type) throw new Error(`Parsing Error: Unknown type ${typeName}`);

    // Rule 3: Split top-level by comma to get field values
    const parts = splitTopLevel(recordStr, ',');

    // Rule 3/1: Values must follow the exact field order
    if (parts.length !== type.fields.length) {
        // Note: Strict validation against nulls is handled in parseValueRecursive
        // But the number of top-level segments must match the field count
        // Allow missing trailing segments if they are nulls/undefined for flexibility
        if (parts.length > type.fields.length) {
            throw new Error(`Structure Error: Too many fields found in record for type ${typeName}. Expected ${type.fields.length}, found ${parts.length}`);
        }
    }

    const obj: EmonDataRecord = {};
    type.fields.forEach((field, idx) => {
        const raw = parts[idx] !== undefined ? parts[idx] : 'null';
        obj[field.name] = parseValueRecursive(field.type, raw, schemas);
    });
    return obj;
};

// --- MAIN PARSER ---

/**
 * Converts a complete EMON string into its corresponding JavaScript object/array structure.
 * @param emonStr The EMON data (schema + records).
 * @returns The resulting JSON object or array.
 */
export const emonToJSON = (emonStr: string): { jsonData: EmonDataRecord | EmonDataRecord[], emonData: EmonDataRecord | EmonDataRecord[], emonSchema: EmonSchema, rootTypeName: string } => {
    if (typeof emonStr !== 'string') throw new Error('EMON input must be a string');

    // Rule 8/9: Filter out comments and trim lines
    const lines = emonStr.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@') && !l.startsWith('import'));

    const schemas: EmonSchema = {};
    const records: EmonDataRecord[] = [];
    let rootType: EmonType | null = null;
    let rootTypeName: string | null = null;

    for (const line of lines) {
        if (line.startsWith('#')) {
            const typeDef = parseTypeDefinition(line);
            schemas[typeDef.name] = typeDef;
            rootType = typeDef; // Assume the last defined type is the root type if no records yet
            rootTypeName = typeDef.name;

        } else if (line.startsWith('=')) {
            if (!rootType || !rootTypeName) {
                throw new Error("Parsing Error: Data record '=' found before any schema definition '#'.");
            }
            const payload = line.slice(1).trim();
            const obj = parseRecord(rootTypeName, payload, schemas);
            records.push(obj);
        }
    }

    if (!rootType) {
        throw new Error('Parsing Error: No EMON schema definition found.');
    }

    // Since rootType is guaranteed non-null here, rootTypeName is also guaranteed non-null.
    const jsonData = rootType.isArray ? records : records[0];

    return {
        jsonData,
        emonData: jsonData, // For consistent internal use
        emonSchema: schemas,
        rootTypeName: rootTypeName! // FIX: Using non-null assertion as the preceding check guarantees it's a string
    };
};