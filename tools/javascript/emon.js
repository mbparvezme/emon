const EMON = (() => {

  const isQuoted = str => /^".*"$/.test(str);
  const unquote = str => str.replace(/^"(.*)"$/, '$1');
  const serializeValue = (val, type) => (typeof val === 'string' && val.includes(' ')) ? `"${val}"` : val;

  // Helper Functions
  const splitValues = line => {
    const values = [];
    let buffer = '', depth = 0, inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuote = !inQuote;
      if (!inQuote) {
        if (ch === '{' || ch === '[') depth++;
        if (ch === '}' || ch === ']') depth--;
        if (ch === ',' && depth === 0) {
          values.push(buffer.trim());
          buffer = '';
          continue;
        }
      }
      buffer += ch;
    }
    if (buffer) values.push(buffer.trim());
    return values;
  };

  const castValue = (type, val, types) => {
    if (val === 'null') return null;
    if (type === 'number') return Number(val);
    if (type === 'bool') return val === 'true';
    if (type.startsWith('#')) {
      const nestedType = type.slice(1);
      val = val.replace(/^{|}$/g, '');
      return parseValue(nestedType, val, types);
    }
    if (type.startsWith('[')) {
      const innerType = type.slice(1, -1);
      val = val.replace(/^\[|\]$/g, '');
      if (!val) return [];
      return splitValues(val).map(v => castValue(innerType, v.trim(), types));
    }
    if (type.startsWith('(')) {
      const fields = type.slice(1, -1).split(',').map(f => f.trim());
      val = val.replace(/^{|}$/g, '');
      const innerValues = splitValues(val);
      const obj = {};
      fields.forEach((f, i) => {
        const [fieldName, fieldType] = f.split(':');
        obj[fieldName] = castValue(fieldType, innerValues[i], types);
      });
      return obj;
    }
    return isQuoted(val) ? unquote(val) : val;
  };

  const parseType = line => {
    const match = line.match(/^#(\w+)(\((.*)\))(\[\])?$/);
    if (!match) throw new Error("Invalid type definition: " + line);
    const [, name, , fieldsStr, isArray] = match;
    const fields = fieldsStr ? fieldsStr.split(',').map(f => f.trim()) : [];
    return { name, fields, isArray: !!isArray };
  };

  const parseValue = (typeName, line, types) => {
    if (!types[typeName]) throw new Error("Type not defined: " + typeName);
    const type = types[typeName];
    const values = splitValues(line);
    if (values.length !== type.fields.length)
      throw new Error(`Field count mismatch for type ${typeName}`);
    const obj = {};
    type.fields.forEach((f, i) => {
      const [fieldName, fieldType] = f.split(':');
      obj[fieldName] = castValue(fieldType, values[i], types);
    });
    return obj;
  };

  // Auto Schema Generator
  const generateSchema = (jsonData, typeName) => {
    typeName = typeName ?? 'emon'
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const schemas = {};
    const usedNames = new Set();

    const makeTypeName = name => {
      let t = name || 'anon';
      if (!usedNames.has(t)) { usedNames.add(t); return t; }
      let i = 1; while (usedNames.has(`${t}${i}`)) i++; usedNames.add(`${t}${i}`); return `${t}${i}`;
    };

    const detectType = (val, parentName) => {
      if (val === null) return 'string';
      if (Array.isArray(val)) {
        if (val.length === 0) return '[string]';
        const firstType = detectType(val[0], parentName);
        return `[${firstType}]`;
      }
      if (typeof val === 'number') return 'number';
      if (typeof val === 'boolean') return 'bool';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'object') {
        const nestedName = '#' + makeTypeName(parentName);
        genSchema(nestedName.slice(1), val);
        return nestedName;
      }
      return 'string';
    };

    const genSchema = (name, obj) => {
      const fields = [];
      for (const k in obj) {
        const val = obj[k];
        let type = detectType(val, k);
        if (Array.isArray(val) && val.length && typeof val[0] === 'object' && !Array.isArray(val[0])) {
          const inlineFields = Object.keys(val[0]).map(f => `${f}:${detectType(val[0][f], f)}`).join(',');
          type = `[(${inlineFields})]`;
        }
        if (typeof val === 'object' && !Array.isArray(val)) {
          type = '#' + makeTypeName(k);
          genSchema(type.slice(1), val);
        }
        fields.push(`${k}:${type}`);
      }
      schemas[name] = `#${name}(${fields.join(',')})`;
    };

    if (Array.isArray(data)) genSchema(typeName, data[0]), schemas[typeName] += '[]';
    else genSchema(typeName, data);

    return Object.values(schemas).join('\n');
  };

  // JSON -> EMON
  const jsonToEmon = (jsonData, schemaName = null, schemaStr = null) => {

    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch {
        throw new Error('Invalid JSON string!');
      }
    }

    if (!schemaStr) schemaStr = generateSchema(jsonData, schemaName);
    const lines = schemaStr.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//'));

    const types = {};
    let currentType = null;
    for (const line of lines) {
      if (line.startsWith('#')) {
        const typeDef = parseType(line);
        types[typeDef.name] = typeDef;
        currentType = typeDef.name;
      }
    }

    const convertNested = (fieldType, val) => {
      if (fieldType.startsWith('#')) return `{${convert(fieldType.slice(1), val)}}`;
      if (fieldType.startsWith('[')) {
        const innerType = fieldType.slice(1, -1);
        return `[${val.map(v => convertNested(innerType, v)).join(',')}]`;
      }
      if (fieldType.startsWith('(')) {
        const inlineFields = fieldType.slice(1, -1).split(',').map(f => f.trim());
        return `{${inlineFields.map((f, i) => {
          const [n, t] = f.split(':');
          return serializeValue(val[n], t);
        }).join(',')}}`;
      }
      return serializeValue(val, fieldType);
    };

    const convert = (typeName, obj) => {
      const type = types[typeName];
      if (!type) throw new Error(`Unknown type ${typeName}`);
      return type.fields.map(f => {
        const [fieldName, fieldType] = f.split(':');
        const val = obj[fieldName];
        if (val === null || val === undefined) return 'null';
        return convertNested(fieldType, val);
      }).join(',');
    };

    if (types[currentType].isArray) return schemaStr + '\n' + jsonData.map(d => '=' + convert(currentType, d)).join('\n');
    return schemaStr + '\n' + '=' + convert(currentType, jsonData);
  };

  // EMON -> JSON
  const parseEMON = emonStr => {
    const lines = emonStr.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    const types = {};
    const result = [];
    let currentType = null;
    for (const line of lines) {
      if (line.startsWith('#')) {
        const typeDef = parseType(line);
        types[typeDef.name] = typeDef;
        currentType = typeDef.name;
      } else if (line.startsWith('=')) {
        const obj = parseValue(currentType, line.slice(1), types);
        result.push(obj);
      }
    }
    return result.length === 1 ? result[0] : result;
  };

  // Validation
  const validateEMON = emonStr => { try { parseEMON(emonStr); return true; } catch { return false; } };
  const validateJSON = (jsonInput, schemaName, schemaStr) => {
    try {
      let data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      jsonToEmon(data, schemaName, schemaStr); return true;
    }
    catch {
      return false;
    }
  };

  // =================== Chainable Wrapper ===================
  class EMONChain {
    constructor(data, type) {
      this.data = data;
      this.type = type || null;
      this._jsonData = null;
      this._emonData = null;
    }
    toJSON(){
      this.type = 'json';
      this._jsonData = parseEMON(this.data);
      this._emonData = this.data;
      this.data = this._jsonData;
      return this;
    }
    toEMON(schemaName, schema) {
      this.type = 'emon';
      this._emonData = jsonToEmon(this.data, schemaName, schema);
      this._jsonData = this.data;
      this.data = this._emonData;
      return this;
    }
    isValid(type = 'emon', schema = null) { return type === 'json' ? validateJSON(this.data, schema) : validateEMON(this.data); }
    
    // =================== Meta Analysis ===================
    meta(unit = 'KB') {
      const bytes = str => new TextEncoder().encode(str).length;
      const formatSize = b => {
        if (unit === 'B') return b + ' B';
        if (unit === 'KB') return (b / 1024).toFixed(2) + ' KB';
        if (unit === 'MB') return (b / 1024 / 1024).toFixed(2) + ' MB';
        if (unit === 'GB') return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB';
        return b + ' B';
      };

      const toJsonString = data => typeof data === 'string' ? data : JSON.stringify(data, null, 0);
      
      const meta = { input: {}, output: {}, efficiency: null };

  if (this.type === 'json') {
    const inputStr = this._emonData || (typeof this.data === 'string' ? this.data : null);
    const outputStr = this._jsonData !== null ? toJsonString(this._jsonData) : (typeof this.data === 'string' ? this.data : (this.data ? toJsonString(this.data) : null));

    if (inputStr) {
      meta.input = { chars: inputStr.length, size: formatSize(bytes(inputStr)) };
    }
    if (outputStr) {
      meta.output = { chars: outputStr.length, size: formatSize(bytes(outputStr)) };
    }
  }
  else if (this.type === 'emon') {
    const inputStr = this._jsonData !== null ? toJsonString(this._jsonData) : (typeof this.data === 'string' ? this.data : (this.data ? toJsonString(this.data) : null));
    const outputStr = this._emonData || (typeof this.data === 'string' ? this.data : null);

    if (inputStr) {
      meta.input = { chars: inputStr.length, size: formatSize(bytes(inputStr)) };
    }
    if (outputStr) {
      meta.output = { chars: outputStr.length, size: formatSize(bytes(outputStr)) };
    }
  }
    else {
    // If data is string and looks like EMON (starts with # or =), treat as EMON input
    if (typeof this.data === 'string' && (/^#/.test(this.data.trim()) || /^\=/.test(this.data.trim()))) {
      const inputStr = this.data;
      meta.input = { chars: inputStr.length, size: formatSize(bytes(inputStr)) };
    } else {
      // treat as JSON input
      const jsonStr = toJsonString(this.data);
      meta.input = { chars: jsonStr.length, size: formatSize(bytes(jsonStr)) };
    }
  }

      // Fallback if no conversion done
  if (meta.input && meta.output && meta.input.chars > 0) {
    const eff = (1 - (meta.output.chars / meta.input.chars)) * 100;
    meta.efficiency = (eff * 1).toFixed(2) + '%';
  }

      return meta;
    }


    value() { return this.data; }
  }

  // =================== Public API ===================
  return {
    parse: (input, type = null) => new EMONChain(input, type),
    toJSON: parseEMON,
    toEMON: jsonToEmon,
    isValid: (str, type = 'emon', schema = null) => type === 'json' ? validateJSON(str, schema) : validateEMON(str),
    generateSchema
  };

})();

module.exports = EMON;