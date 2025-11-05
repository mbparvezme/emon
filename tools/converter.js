import { EMONParser } from './parser.js';

export class EMONConverter {
    constructor() {
        this.parser = new EMONParser();
    }

    // EMON → JSON
    emonToJSON(emonText) {
        return this.parser.parse(emonText);
    }

    // JSON → EMON (rebuilds full schema + data)
    jsonToEMON(jsonArray, definitionName) {
        if (!Array.isArray(jsonArray)) throw new Error('Input must be an array of objects');
        if (!this.parser.definitions[definitionName]) throw new Error(`Unknown definition: ${definitionName}`);

        const fields = this.parser.definitions[definitionName];

        // Build schema definitions (including nested)
        const schemaLines = this._buildSchema(definitionName, new Set());

        // Build records
        const recordLines = jsonArray.map(obj => {
            const values = fields.map(f => this._formatValue(obj[f.key], f.type));
            return `=${values.join(',')}`;
        });

        return [...schemaLines, ...recordLines].join('\n');
    }

    _buildSchema(defName, seen) {
        if (seen.has(defName)) return [];
        seen.add(defName);

        const fields = this.parser.definitions[defName];
        if (!fields) throw new Error(`Unknown definition: ${defName}`);

        // Handle nested references first
        const nestedSchemas = [];
        fields.forEach(f => {
            if (f.type.startsWith('#')) {
                const nestedName = f.type.slice(1);
                nestedSchemas.push(...this._buildSchema(nestedName, seen));
            }
        });

        const schemaLine = `#${defName}(${fields.map(f => `${f.key}:${f.type}`).join(',')})`;
        return [...nestedSchemas, schemaLine];
    }

_formatValue(val, type) {
    if (val === null || val === undefined) return '';

    // Array of nested objects
    if (type.startsWith('#') && type.endsWith('[]')) {
        const defName = type.slice(1, -2); // remove # and []
        const nestedFields = this.parser.definitions[defName];
        return `[${val.map((obj) => {
            const nestedVals = nestedFields.map(f => this._formatValue(obj[f.key], f.type));
            return `{${nestedVals.join(',')}}`;
        }).join(',')}]`;
    }

    // Single nested object
    if (type.startsWith('#')) {
        const defName = type.slice(1);
        const nestedFields = this.parser.definitions[defName];
        const nestedVals = nestedFields.map(f => this._formatValue(val[f.key], f.type));
        return `{${nestedVals.join(',')}}`;
    }

    // Array of primitives
    if (Array.isArray(val)) return `[${val.map(v => this._formatValue(v, 'string')).join(',')}]`;

    // Boolean or number
    if (typeof val === 'boolean' || typeof val === 'number') return val.toString();

    // String: add quotes only if spaces or special characters
    if (typeof val === 'string') {
        if (/\s|[^a-zA-Z0-9]/.test(val)) return `"${val}"`;
        return val;
    }

    return String(val);
}


}
