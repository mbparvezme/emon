// Internal representation of a field type reference
export type EmonPrimitiveType = 'string' | 'number' | 'bool';
export type EmonFieldType = EmonPrimitiveType | `#${string}` | `[${string}]`;

// Internal representation of a field definition
export interface EmonField {
    name: string;
    type: string; // Can be EmonFieldType or a complex inline type string
}

// Internal representation of a defined EMON type
export interface EmonType {
    name: string;
    fields: EmonField[];
    isArray: boolean; // Does the root type end with []
    isInline?: boolean; // For inline object types (not currently supported in JSON flow but reserved)
}

// Internal representation of the parsed EMON schema
export interface EmonSchema {
    [typeName: string]: EmonType;
}

// Internal representation of the EMON data (parsed records)
export type EmonDataRecord = { [key: string]: any };

// Structure for the meta output
export interface Metrics {
    chars: number;
    size: string; // e.g., "1.23 KB"
}

export interface MetaData {
    input: Metrics;
    output: Metrics;
    efficiency: string; // e.g., "34.56%"
}

// Internal structure to hold the conversion context for chaining
export interface ConversionContext {
    inputData: string | object; // Original data string/object (e.g., JSON)
    outputData: string | object; // Final result string/object (e.g., EMON string)
    sourceFormat: 'json' | 'yml' | 'xml' | 'emon' | null;
    targetFormat: 'json' | 'yml' | 'xml' | 'emon' | null;
    // Internal EMON representation (parsed)
    emonData: {
        schema: EmonSchema;
        records: EmonDataRecord[];
        rootTypeName: string;
    } | null;
}