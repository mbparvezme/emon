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
        if (!this.parser.definitions[definitionName]) throw new Error(`Unknown definition: ${ definitionName } `);

        const fields = this.parser.definitions[definitionName];

        // Rebuild schema definitions (including nested)
        let schemaLines = this._buildSchema(definitionName, new Set());

        // Build records
        const recordLines = jsonArray.map(obj => {
            const values = fields.map(f => this._formatValue(obj[f.key], f.type));
            return `= ${ values.join(', ') } `;
        });

        return [...schemaLines, ...recordLines].join('\n');
    }

    _buildSchema(defName, seen) {
        if (seen.has(defName)) return [];
        seen.add(defName);

        const fields = this.parser.definitions[defName];
        if (!fields) throw new Error(`Unknown definition: ${ defName } `);

        // Check nested references first
        const nestedSchemas = [];
        fields.forEach(f => {
            if (f.type.startsWith('#')) {
                const nestedName = f.type.slice(1);
                nestedSchemas.push(...this._buildSchema(nestedName, seen));
            }
        });

        const schemaLine = `#${ defName } (${ fields.map(f => `${f.key}:${f.type}`).join(', ') })`;
        return [...nestedSchemas, schemaLine];
    }

    _formatValue(val, type) {
        if (val === null || val === undefined) return '';
        if (Array.isArray(val) || (typeof val === 'object' && !type.startsWith('#'))) return JSON.stringify(val);
        if (type.startsWith('#') && typeof val === 'object') {
            const defName = type.slice(1);
            const nestedFields = this.parser.definitions[defName];
            const nestedVals = nestedFields.map(f => this._formatValue(val[f.key], f.type));
            return `{${ nestedVals.join(', ') } } `;
        }
        if (typeof val === 'string') return `"${val}"`;
        return val;
    }

}