export type EmonPrimitiveType = 'string' | 'number' | 'bool';
export type EmonFieldType = EmonPrimitiveType | `#${string}` | `[${string}]`;

/** Represents a single key-value object in the data layer. */
export interface EmonDataRecord {
    [key: string]: any;
}

/** Represents the definition of a single field within a schema. */
export interface EmonField {
    name: string;
    type: string; // e.g., 'string', 'number', 'bool', '[#typeName]', '#typeName'
}

/** Represents a complete schema definition (Type). */
export interface EmonType {
    name: string;
    fields: EmonField[];
    isArray: boolean; // True if the root type is defined with []
    isInline?: boolean; // For inline object types (not currently supported in JSON flow but reserved)
}

/** Represents the entire collection of named schemas. */
export interface EmonSchema {
    [key: string]: EmonType;
}

export interface Metrics {
    chars: number;
    size: string;
}

export interface MetaData {
    input: Metrics;
    output: Metrics;
    efficiency: string;
}



/** The result object returned by the main serialization function. */
export interface EmonConversionResult {
    emonString: string;
    emonData: EmonDataRecord | EmonDataRecord[];
    emonSchema: EmonSchema;
    rootTypeName: string;
}

// export interface ConversionContext {
//     inputData: string | object; // Original data string/object (e.g., JSON)
//     outputData: string | object; // Final result string/object (e.g., EMON string)
//     sourceFormat: 'json' | 'yml' | 'xml' | 'emon' | null;
//     targetFormat: 'json' | 'yml' | 'xml' | 'emon' | null;
//     // Internal EMON representation (parsed)
//     emonData: {
//         schema: EmonSchema;
//         records: EmonDataRecord[];
//         rootTypeName: string;
//     } | null;
// }