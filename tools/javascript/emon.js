// emon.js
// Full-featured, robust, stateless, chainable EMON library
// Place at ./emon/tools/javascript/emon.js

const EMON = (() => {
  // -----------------------
  // Helpers
  // -----------------------
  const isQuoted = str => typeof str === 'string' && /^".*"$/.test(str);
  const unquote = str => typeof str === 'string' ? str.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"') : str;

  // Quote rules: quote if contains space or special char other than - _ . @ (common tokens)
  const needsQuote = s => typeof s === 'string' && /[\s,{}[\]()"']/g.test(s);
  const serializePrimitive = (val, typeHint) => {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'string') {
      // always escape internal quotes
      const escaped = val.replace(/"/g, '\\"');
      return needsQuote(val) ? `"${escaped}"` : escaped;
    }
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return String(val);
    // fallback stringify
    return String(val);
  };

  // Quote-aware top-level splitter (handles nested {}, [], (), and quotes).
  // delimiter default ','
  const splitTopLevel = (str, delimiter = ',') => {
    if (str === undefined || str === null) return [];
    str = String(str);
    const out = [];
    let buf = '';
    let depth = 0;
    let inQuote = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const prev = str[i - 1];

      if (ch === '"' && prev !== '\\') {
        inQuote = !inQuote;
      }

      if (!inQuote) {
        if (ch === '{' || ch === '[' || ch === '(') depth++;
        else if (ch === '}' || ch === ']' || ch === ')') depth--;
        if (ch === delimiter && depth === 0) {
          out.push(buf);
          buf = '';
          continue;
        }
      }
      buf += ch;
    }
    if (buf !== '') out.push(buf);
    return out.map(s => s.trim());
  };

  // split values for a record (alias of splitTopLevel with comma)
  const splitValues = line => splitTopLevel(line, ',');

  // -----------------------
  // Type parsing
  // -----------------------
  const parseType = line => {
    // #name(field:type,field2:type2)[]
    const match = line.match(/^#([A-Za-z_]\w*)(\((.*)\))?(\[\])?$/);
    if (!match) throw new Error("Invalid type definition: " + line);
    const [, name, , fieldsStr, isArray] = match;
    // split fields by top-level commas (fields won't contain nested brackets in declaration)
    const fields = fieldsStr ? fieldsStr.split(',').map(f => f.trim()).filter(Boolean) : [];
    return { name, fields, isArray: !!isArray };
  };

  // -----------------------
  // Schema generation
  // -----------------------
  const generateSchema = (jsonData, rootName = 'emon') => {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const schemas = {};                // name -> '#name(...)'
    const usedNames = new Set();

    const makeTypeName = (preferred) => {
      let base = (preferred || 'anon').replace(/[^A-Za-z0-9_]/g, '') || 'anon';
      base = base.toLowerCase();
      if (!usedNames.has(base)) { usedNames.add(base); return base; }
      let i = 1;
      while (usedNames.has(`${base}${i}`)) i++;
      usedNames.add(`${base}${i}`);
      return `${base}${i}`;
    };

    const detectType = (val, propName) => {
      if (val === null) return 'string';
      if (Array.isArray(val)) {
        if (val.length === 0) return '[string]';
        const first = val[0];
        // if first is object, create child type for it
        if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
          const childName = makeTypeName(propName || 'item');
          genSchema(childName, first);
          return `[#${childName}]`;
        }
        // primitive array
        const inner = detectType(first, propName);
        return `[${inner.replace(/^\[#?/, '').replace(/\]$/, '')}]`.replace(/\]\]/, ' ]'); // ensure format like [string] or [#child] handled above
      }
      if (typeof val === 'number') return 'number';
      if (typeof val === 'boolean') return 'bool';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'object') {
        const nestedName = makeTypeName(propName || 'child');
        genSchema(nestedName, val);
        return `#${nestedName}`;
      }
      return 'string';
    };

    const genSchema = (name, obj) => {
      if (schemas[name]) return; // already generated
      const fields = [];
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        // array of objects -> define child type and reference as [#child]
        if (Array.isArray(val) && val.length && typeof val[0] === 'object' && !Array.isArray(val[0])) {
          const childName = makeTypeName(key.slice(0, -1) || key);
          genSchema(childName, val[0]);
          fields.push(`${key}:[#${childName}]`);
          continue;
        }

        // nested object
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          const childName = makeTypeName(key);
          genSchema(childName, val);
          fields.push(`${key}:#${childName}`);
          continue;
        }

        // primitive or array of primitives
        const t = detectType(val, key);
        // normalize array of primitive to [string] etc.
        if (Array.isArray(val) && val.length && typeof val[0] !== 'object') {
          const inner = detectType(val[0], key);
          fields.push(`${key}:[${inner}]`);
        } else {
          fields.push(`${key}:${t}`);
        }
      }
      schemas[name] = `#${name}(${fields.join(',')})`;
    };

    if (Array.isArray(data)) {
      genSchema(rootName, data[0] || {});
      // append [] to root type
      schemas[rootName] = schemas[rootName] + '[]';
    } else {
      genSchema(rootName, data || {});
    }

    // return schemas in generation order (schemas may reference each other)
    return Object.values(schemas).join('\n');
  };

  // -----------------------
  // Convert JSON -> EMON
  // returns schema + data lines
  // -----------------------
  const jsonToEmon = (jsonData, schemaName = 'emon', schemaStr = null) => {
    // accept JSON string or object/array
    if (typeof jsonData === 'string') {
      try { jsonData = JSON.parse(jsonData); } catch { throw new Error('Invalid JSON string!'); }
    }

    if (!schemaStr) schemaStr = generateSchema(jsonData, schemaName);
    const lines = schemaStr.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//'));

    // parse types
    const types = {};
    let currentType = null;
    for (const line of lines) {
      if (line.startsWith('#')) {
        const typeDef = parseType(line);
        types[typeDef.name] = typeDef;
        currentType = typeDef.name;
      }
    }

    // serialize primitive or nested according to fieldType
    const convertNested = (fieldType, val) => {
      // val may be null/undefined
      if (val === null || val === undefined) return 'null';

      // named type: "#name" or reference like "[#name]" handled in array branch
      if (typeof fieldType === 'string' && fieldType.startsWith('#')) {
        // named object: convert by its fields
        const tn = fieldType.slice(1);
        return `{${convert(tn, val)}}`;
      }

      // array type
      if (typeof fieldType === 'string' && fieldType.startsWith('[')) {
        // innerType can be e.g. "#skill" or "string"
        let innerType = fieldType.slice(1, -1).trim();
        // handle innerType like '#name' or '#name' with prepended #
        if (innerType.startsWith('#')) {
          // array of named types
          return `[${(Array.isArray(val) ? val : []).map(v => `{${convert(innerType.slice(1), v)}}`).join(',')}]`;
        } else {
          // array of primitives (string/number/bool) or inline objects
          // if array items are objects but schema says primitive, we still try to serialize as inline {..}
          return `[${(Array.isArray(val) ? val : []).map(v => {
            if (typeof v === 'object' && v !== null) {
              // inline object -> convert values in order of object keys (best-effort)
              if (Array.isArray(v)) return `[${v.map(x => serializePrimitive(x)).join(',')}]`;
              // object -> join values (best-effort)
              return `{${Object.values(v).map(x => serializePrimitive(x)).join(',')}}`;
            }
            return serializePrimitive(v, innerType);
          }).join(',')}]`;
        }
      }

      // inline type (a:b,c:d)
      if (typeof fieldType === 'string' && fieldType.startsWith('(') && fieldType.endsWith(')')) {
        const inlineFields = fieldType.slice(1, -1).split(',').map(f => f.trim());
        const parts = inlineFields.map(f => {
          const [n, t] = f.split(':').map(x => x.trim());
          return serializePrimitive(val && val[n] !== undefined ? val[n] : null, t);
        });
        return `{${parts.join(',')}}`;
      }

      // primitive
      return serializePrimitive(val, fieldType);
    };

    const convert = (typeName, obj) => {
      const type = types[typeName];
      if (!type) throw new Error(`Unknown type ${typeName}`);
      const parts = type.fields.map(f => {
        const [fieldName, fieldTypeRaw] = f.split(':').map(x => x.trim());
        const val = obj && obj[fieldName] !== undefined ? obj[fieldName] : null;
        // normalize fieldTypeRaw: could be like "[#child]" or " #child" etc.
        let fieldType = fieldTypeRaw;
        return convertNested(fieldType, val);
      });
      return parts.join(',');
    };

    // produce data lines
    if (Array.isArray(jsonData)) {
      const dataLines = jsonData.map(d => '=' + convert(currentType, d)).join('\n');
      return schemaStr + '\n' + dataLines;
    }
    return schemaStr + '\n' + '=' + convert(currentType, jsonData);
  };

  // -----------------------
  // Parse EMON -> JSON
  // -----------------------
  const parsePrimitive = (val, type) => {
    if (val === undefined || val === null) return null;
    val = String(val).trim();
    if (val === 'null') return null;
    if (type === 'number') {
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }
    if (type === 'bool' || type === 'boolean') {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return Boolean(val);
    }
    // string: remove quotes if present
    if ((type === 'string') || isQuoted(val) || (val.startsWith('"') && val.endsWith('"'))) {
      if (val.startsWith('"') && val.endsWith('"')) return unquote(val);
      return val;
    }
    // fallback: infer
    if (val === 'true') return true;
    if (val === 'false') return false;
    const n = Number(val);
    if (!Number.isNaN(n)) return n;
    if (val.startsWith('"') && val.endsWith('"')) return unquote(val);
    return val;
  };

  const parseValueRecursive = (fieldType, value, types) => {
    if (value === undefined || value === null) return null;
    value = String(value).trim();

    if (value === 'null') return null;

    // named type
    if (fieldType && typeof fieldType === 'string' && fieldType.startsWith('#')) {
      const tn = fieldType.slice(1);
      const inner = value.replace(/^{|}$/g, '');
      return parseRecord(tn, inner, types);
    }

    // array type
    if (fieldType && typeof fieldType === 'string' && fieldType.startsWith('[')) {
      const innerTypeRaw = fieldType.slice(1, -1).trim();
      const inner = value.replace(/^\[|\]$/g, '');
      if (inner === '') return [];
      const items = splitTopLevel(inner, ',');
      return items.map(it => parseValueRecursive(innerTypeRaw, it, types));
    }

    // inline type
    if (fieldType && typeof fieldType === 'string' && fieldType.startsWith('(')) {
      const inlineFields = fieldType.slice(1, -1).split(',').map(f => f.trim());
      const inner = value.replace(/^{|}$/g, '');
      const parts = splitTopLevel(inner, ',');
      const obj = {};
      inlineFields.forEach((f, idx) => {
        const [name, t] = f.split(':').map(x => x.trim());
        obj[name] = parseValueRecursive(t, parts[idx] === undefined ? 'null' : parts[idx], types);
      });
      return obj;
    }

    // primitive
    return parsePrimitive(value, fieldType);
  };

  const parseRecord = (typeName, recordStr, types) => {
    const type = types[typeName];
    if (!type) throw new Error(`Unknown type ${typeName}`);
    // split top-level by comma
    const parts = splitTopLevel(recordStr, ',');
    const obj = {};
    type.fields.forEach((f, idx) => {
      const [name, t] = f.split(':').map(x => x.trim());
      const raw = parts[idx] === undefined ? 'null' : parts[idx];
      obj[name] = parseValueRecursive(t, raw, types);
    });
    return obj;
  };

  const parseEMON = emonStr => {
    if (typeof emonStr !== 'string') throw new Error('EMON input must be string');
    const lines = emonStr.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    const types = {};
    const result = [];
    let currentType = null;
    for (const line of lines) {
      if (line.startsWith('#')) {
        const td = parseType(line);
        types[td.name] = td;
        currentType = td.name;
      } else if (line.startsWith('=')) {
        const payload = line.slice(1).trim();
        const obj = parseRecord(currentType, payload, types);
        result.push(obj);
      }
    }
    return result.length === 1 ? result[0] : result;
  };

  // -----------------------
  // Validation helpers
  // -----------------------
  const validateEMON = emonStr => {
    try { parseEMON(emonStr); return true; } catch (e) { return false; }
  };

  const validateJSON = (jsonInput, schemaName = 'emon', schemaStr = null) => {
    try {
      let data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      jsonToEmon(data, schemaName, schemaStr);
      return true;
    } catch (e) {
      return false;
    }
  };

  // -----------------------
  // Chainable wrapper
  // -----------------------
  class EMONChain {
    constructor(data, type) {
      this.data = data;
      this.type = type || null; // 'json' means last operation produced json; 'emon' means last produced emon
      this._jsonData = null;    // holds JSON object when conversion happened
      this._emonData = null;    // holds EMON string when conversion happened
    }

    toJSON() {
      // Expect current data to be EMON string (or maybe already object)
      this.type = 'json';
      // store emon input
      this._emonData = (typeof this.data === 'string') ? this.data : null;
      // parse
      const parsed = parseEMON(this.data);
      this._jsonData = parsed;
      this.data = parsed;
      return this;
    }

    toEMON(schemaName = 'emon', schemaStr = null) {
      this.type = 'emon';
      // if data is a string representing JSON, parse it
      let jsonInput = this.data;
      if (typeof jsonInput === 'string') {
        try { jsonInput = JSON.parse(jsonInput); } catch { /* keep as-is if not JSON string */ }
      }
      // store json input
      this._jsonData = typeof jsonInput === 'string' ? null : jsonInput;
      // convert
      const emon = jsonToEmon(jsonInput, schemaName, schemaStr);
      this._emonData = emon;
      this.data = emon;
      return this;
    }

    isValid(type = 'emon', schemaName = 'emon', schemaStr = null) {
      if (type === 'json') return validateJSON(this.data, schemaName, schemaStr);
      return validateEMON(this.data);
    }

    // meta returns object:
    // { input: { chars, size }, output: { chars, size }, efficiency: 'xx.xx%' }
    meta(unit = 'KB') {
      const bytes = str => new TextEncoder().encode(str).length;
      const formatSize = b => {
        if (unit === 'B') return b + ' B';
        if (unit === 'KB') return (b / 1024).toFixed(2) + ' KB';
        if (unit === 'MB') return (b / 1024 / 1024).toFixed(2) + ' MB';
        if (unit === 'GB') return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB';
        return b + ' B';
      };

      const toJsonString = d => (typeof d === 'string' ? d : JSON.stringify(d));

      let input = null;
      let output = null;

      // If last op produced JSON (toJSON), input was EMON, output JSON
      if (this.type === 'json') {
        input = this._emonData || (typeof this.data === 'string' ? this.data : null);
        output = (this._jsonData !== null && this._jsonData !== undefined) ? toJsonString(this._jsonData) : (typeof this.data === 'string' ? this.data : (this.data ? toJsonString(this.data) : null));
      }
      // If last op produced EMON (toEMON), input was JSON, output EMON
      else if (this.type === 'emon') {
        input = (this._jsonData !== null && this._jsonData !== undefined) ? toJsonString(this._jsonData) : (typeof this.data === 'string' ? this.data : (this.data ? toJsonString(this.data) : null));
        output = this._emonData || (typeof this.data === 'string' ? this.data : null);
      } else {
        // no conversion done: infer input type
        if (typeof this.data === 'string' && (/^#/.test(this.data.trim()) || /^\=/.test(this.data.trim()))) {
          input = this.data;
        } else {
          input = toJsonString(this.data);
        }
      }

      const meta = {};
      if (input) {
        const chars = String(input).length;
        meta.input = { chars, size: formatSize(bytes(String(input))) };
      }
      if (output) {
        const chars = String(output).length;
        meta.output = { chars, size: formatSize(bytes(String(output))) };
      }
      if (meta.input && meta.output && meta.input.chars > 0) {
        const eff = (1 - (meta.output.chars / meta.input.chars)) * 100;
        meta.efficiency = eff.toFixed(2) + '%';
      }

      return meta;
    }

    value() { return this.data; }
  }

  // -----------------------
  // Public API (stateless helpers + chainable)
  // -----------------------
  return {
    parse: (input, type = null) => new EMONChain(input, type),
    toJSON: emonStr => parseEMON(emonStr),
    toEMON: (jsonData, schemaName = 'emon', schemaStr = null) => jsonToEmon(jsonData, schemaName, schemaStr),
    isValid: (str, type = 'emon', schemaName = 'emon', schemaStr = null) => type === 'json' ? validateJSON(str, schemaName, schemaStr) : validateEMON(str),
    generateSchema
  };
})();

module.exports = EMON;
