export class EMONParser {
    constructor() {
        this.definitions = {};
    }

    parse(emonText) {
        const lines = emonText
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean);
        const records = [];

        for (let line of lines) {
            if (line.startsWith('#')) {
                this._parseDefinition(line);
            } else if (line.startsWith('=')) {
                const record = this._parseRecord(line);
                records.push(record);
            }
        }

        return records;
    }

    _parseDefinition(line) {
        const match = line.match(/^#([a-zA-Z_][\w]*)\((.*)\)$/);
        if (!match) throw new Error(`Invalid definition: ${line}`);
        const [, name, fieldsStr] = match;

        const fields = fieldsStr.split(',').map(f => {
            const [key, type] = f.split(':').map(s => s.trim());
            return { key, type };
        });

        this.definitions[name] = fields;
    }

    _parseRecord(line) {
        const recordStr = line.slice(1).trim();
        const values = this._splitValues(recordStr);

        // Map to the last added definition
        const lastDefName = Object.keys(this.definitions).pop();
        const fields = this.definitions[lastDefName];
        if (!fields) throw new Error(`No definition found for record: ${line}`);

        const obj = {};
        fields.forEach((f, i) => {
            obj[f.key] = this._convertValue(values[i], f.type);
        });

        return obj;
    }

    _splitValues(str) {
        const result = [];
        let current = '';
        let depth = 0;
        let inString = false;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (char === '"' && str[i - 1] !== '\\') inString = !inString;

            if (!inString) {
                if (char === '{' || char === '[') depth++;
                if (char === '}' || char === ']') depth--;
                if (char === ',' && depth === 0) {
                    result.push(current.trim());
                    current = '';
                    continue;
                }
            }
            current += char;
        }
        if (current) result.push(current.trim());
        return result;
    }

    _convertValue(val, type) {
        if (!val) return null;
        val = val.trim();

        // Nested array/object
        if (val.startsWith('{') && val.endsWith('}')) {
            const inner = val.slice(1, -1);
            return this._splitValues(inner).map(v => this._convertValue(v, 'string'));
        }
        if (val.startsWith('[') && val.endsWith(']')) {
            const inner = val.slice(1, -1);
            return this._splitValues(inner).map(v => this._convertValue(v, 'string'));
        }

        // Primitive types
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (!isNaN(Number(val))) return Number(val);

        // Reference type
        if (type.startsWith('#')) return { __ref: val };

        // String: remove quotes only if allowed
        if (/^".*"$/.test(val)) return val.slice(1, -1);
        return val;
    }
}
