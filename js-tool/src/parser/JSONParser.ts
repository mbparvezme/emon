import { EmonSchema, EmonField, EmonDataRecord } from "../types";
import { validateSchemaName, serializePrimitive, splitTopLevel } from "../utils";

// Helper class to manage unique names for automatically generated schemas
class SchemaGenerator {
    private schemas: EmonSchema = {};
    private usedNames: Set<string> = new Set();
    private generatedOrder: string[] = [];

    /**
     * Ensures a unique, valid type name is generated.
     * @param preferred A preferred name derived from the JSON key.
     * @returns A unique schema name.
     */
    public makeTypeName(preferred: string): string { // FIX 1: Changed to public
        let base = (preferred || 'anon').replace(/[^A-Za-z0-9_]/g, '') || 'anon';
        base = base.toLowerCase();

        if (validateSchemaName(base) && !this.usedNames.has(base)) {
            this.usedNames.add(base);
            this.generatedOrder.push(base);
            return base;
        }

        let i = 1;
        let uniqueName = `${base}${i}`;
        while (!validateSchemaName(uniqueName) || this.usedNames.has(uniqueName)) {
            i++;
            uniqueName = `${base}${i}`;
        }
        this.usedNames.add(uniqueName);
        this.generatedOrder.push(uniqueName);
        return uniqueName;
    }

    /**
     * Recursively analyzes a JSON value to determine its EMON type and generate
     * nested schemas if necessary.
     * @param val The JSON value.
     * @param propName The JSON property name (used for naming child schemas).
     * @returns The EMON field type string (e.g., 'string', '[#member]', '#profile').
     */
    private detectType(val: any, propName: string): string {
        if (val === null || val === undefined) return 'string';
        if (typeof val === 'number') return 'number';
        if (typeof val === 'boolean') return 'bool';
        if (typeof val === 'string') return 'string';

        // --- Array Handling ---
        if (Array.isArray(val)) {
            if (val.length === 0) return '[string]'; // Default to string array if empty

            const first = val[0];
            const innerPropName = propName.endsWith('s') ? propName.slice(0, -1) : propName + 'Item';

            // Array of Objects (Rule 2: #type[] -> array of objects)
            if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
                const childName = this.makeTypeName(innerPropName);
                this.genSchema(childName, first); // Generate schema for the array item
                return `[#${childName}]`;
            }

            // Array of Primitives (Rule 7: [type] -> array of primitives)
            const innerType = this.detectType(first, innerPropName);
            return `[${innerType}]`;
        }

        // --- Object Handling (Nested Type) ---
        if (typeof val === 'object' && val !== null) {
            const nestedName = this.makeTypeName(propName || 'child');
            this.genSchema(nestedName, val);
            return `#${nestedName}`;
        }

        return 'string';
    }

    /**
     * Generates the EMON type definition for a given JSON object structure.
     * Uses recursive type detection to handle nested objects and arrays.
     * @param name The desired name for the schema.
     * @param obj The sample JSON object/array item.
     */
    public genSchema(name: string, obj: EmonDataRecord) {
        if (this.schemas[name]) return; // Already generated

        const fields: EmonField[] = [];
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            const fieldType = this.detectType(val, key);
            fields.push({ name: key, type: fieldType });
        }

        this.schemas[name] = {
            name,
            fields,
            isArray: false,
        };
    }

    /**
     * Gets the generated schema and the ordered list of type names.
     * @returns { schemas: EmonSchema, order: string[] }
     */
    public getSchemas(): { schemas: EmonSchema, order: string[] } {
        return { schemas: this.schemas, order: this.generatedOrder };
    }
}

// --- EMON DATA SERIALIZATION ---

/**
 * Converts a single JSON value into its EMON string segment using a known field type.
 * Handles nested objects ({}) and arrays ([]).
 * @param fieldType The declared EMON type for the field.
 * @param val The JavaScript value to serialize.
 * @param schemas The complete generated EMON schema map.
 * @returns The EMON string segment (e.g., 'Alice', '{High,50}', '[1,2,3]').
 */
const serializeValue = (fieldType: string, val: any, schemas: EmonSchema): string => {
    if (val === null || val === undefined) return 'null';

    // 1. Array Type (e.g., '[string]', '[#member]')
    if (fieldType.startsWith('[') && fieldType.endsWith(']')) {
        const innerTypeRaw = fieldType.slice(1, -1);
        if (!Array.isArray(val)) return '[]';

        const serializedItems = val.map(item => {
            if (innerTypeRaw.startsWith('#')) {
                // Array of Custom Types: Requires {} nesting and conversion based on schema
                const typeName = innerTypeRaw.slice(1);
                return `{${serializeRecord(typeName, item, schemas)}}`;
            } else if (typeof item === 'object' && item !== null) {
                // Array of Inline/Anonymous Objects (Best-effort serialization using Object.values)
                // This case should be rare if schema generation is done correctly
                return `{${Object.values(item).map(serializePrimitive).join(',')}}`;
            } else {
                // Array of Primitives
                return serializePrimitive(item);
            }
        });

        // Rule 5: No unnecessary spaces inside structures
        return `[${serializedItems.join(',')}]`;
    }

    // 2. Custom Type Reference (e.g., '#member')
    if (fieldType.startsWith('#')) {
        const typeName = fieldType.slice(1);
        if (typeof val !== 'object' || val === null) return 'null';

        // Custom Type: Requires {} nesting and conversion based on schema
        // Rule 5: No unnecessary spaces inside structures
        return `{${serializeRecord(typeName, val, schemas)}}`;
    }

    // 3. Primitive Type (e.g., 'string', 'number', 'bool')
    return serializePrimitive(val);
};

/**
 * Converts a single JSON object (record) into its EMON string segment.
 * @param typeName The name of the schema type to use.
 * @param obj The JSON object to convert.
 * @param schemas The complete generated EMON schema map.
 * @returns The comma-separated EMON record string (e.g., 'Parvez,30,true').
 */
const serializeRecord = (typeName: string, obj: EmonDataRecord, schemas: EmonSchema): string => {
    const type = schemas[typeName];
    if (!type) throw new Error(`Serialization Error: Unknown type ${typeName}`);

    // Rule 3/1: Values must follow the exact field order defined in the schema
    const parts = type.fields.map(field => {
        const val = obj[field.name];
        return serializeValue(field.type, val, schemas);
    });

    return parts.join(',');
};

/**
 * Main function to convert JSON data (string or object) to a complete EMON string.
 * @param jsonData The input JSON data.
 * @param schemaName The desired name for the root schema.
 * @returns The complete EMON string (Schema + Data).
 */
export const jsonToEmonString = (jsonData: any, schemaName: string): { emonString: string, emonData: EmonDataRecord | EmonDataRecord[], emonSchema: EmonSchema, rootTypeName: string } => {
    if (!validateSchemaName(schemaName)) {
        throw new Error(`Invalid schema name provided: "${schemaName}". Must be alphanumeric/underscore and cannot start with a number.`);
    }

    let data: any;
    if (typeof jsonData === 'string') {
        try { data = JSON.parse(jsonData); } catch { throw new Error('Invalid JSON string provided.'); }
    } else {
        data = jsonData;
    }

    if (data === null || data === undefined) {
        throw new Error('JSON data cannot be null or undefined.');
    }

    // 1. Schema Generation
    const generator = new SchemaGenerator();
    let rootTypeName = schemaName;
    const isRootArray = Array.isArray(data);

    if (isRootArray) {
        const sample = data.length > 0 ? data[0] : {};
        rootTypeName = generator.makeTypeName(schemaName.endsWith('s') ? schemaName.slice(0, -1) : schemaName + 'Item');
        generator.genSchema(rootTypeName, sample);
    } else {
        generator.genSchema(schemaName, data);
    }

    const { schemas: generatedSchemas, order: generatedOrder } = generator.getSchemas();

    // 2. Format Schema String
    const schemaLines: string[] = [];
    for (const name of generatedOrder) {
        const type = generatedSchemas[name];
        let typeLine = `#${name}(${type.fields.map(f => `${f.name}:${f.type}`).join(',')})`;
        // If the generated type is the main root array, append []
        if (isRootArray && name === rootTypeName) {
            typeLine += '[]';
            // Correct the internal schema representation for the root
            generatedSchemas[name].isArray = true;
        }
        schemaLines.push(typeLine);
    }
    const schemaStr = schemaLines.join('\n');

    // 3. Format Data String
    const dataRecords = isRootArray ? data : [data];
    const dataLines = dataRecords.map((record: EmonDataRecord) => { // FIX 2: Explicitly type 'record'
        return '=' + serializeRecord(isRootArray ? rootTypeName : schemaName, record, generatedSchemas);
    }).join('\n');
    // 4. Return
    const finalEmonString = schemaStr + '\n' + dataLines;

    const emonData: EmonDataRecord[] = dataRecords;

    // The rootTypeName for the EMON structure is the name of the main type
    const finalRootTypeName = isRootArray ? rootTypeName : schemaName;
    return {
        emonString: finalEmonString,
        emonData: isRootArray ? emonData : emonData[0],
        emonSchema: generatedSchemas,
        rootTypeName: finalRootTypeName
    };
};