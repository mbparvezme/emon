import { ConversionContext, MetaData, EmonDataRecord } from "./types";
import { generateMetaData, serializePrimitive } from "./utils";
import { jsonToEmonString } from "./parser";
import { emonToJSON } from "./serializer";

// Helper to convert internal data (object/array) to a string for metric calculation
const toJsonString = (data: any): string => {
    // If the data is already a string (which happens if data is EMON string), use it directly
    if (typeof data === 'string') return data;
    // Otherwise, stringify the object for size comparison with EMON
    return JSON.stringify(data);
};

/**
 * The main class for the chainable EMON conversion API.
 * Manages the conversion state and metadata collection.
 */
class EMONChain {
    private context: ConversionContext;

    /**
     * Initializes the chain with the original input data.
     * @param data The input data (string or object).
     * @param sourceFormat The format of the input data.
     */
    constructor(data: string | object, sourceFormat: 'json' | 'emon' | null) {
        this.context = {
            inputData: data,
            outputData: data,
            sourceFormat,
            targetFormat: null,
            emonData: null,
        };
    }

    // --- FROM METHODS ---

    /**
     * Converts JSON data (string or object) into an internal EMON structure.
     * Starts the conversion chain.
     * @param jsonData The JSON data.
     * @param schemaName The name of the root EMON schema (optional, default 'emon').
     * @returns The chainable instance.
     */
    public fromJSON(jsonData: any, schemaName: string = 'emon'): this {
        this.context.inputData = jsonData;
        this.context.sourceFormat = 'json';
        this.context.targetFormat = 'emon';
        
        const { emonString, emonData, emonSchema, rootTypeName } = jsonToEmonString(jsonData, schemaName);

        // Store EMON data structure internally
        this.context.emonData = {
            schema: emonSchema,
            records: Array.isArray(emonData) ? emonData : [emonData],
            rootTypeName: rootTypeName
        };
        this.context.outputData = emonString;

        return this;
    }

    // --- TO METHODS ---

    /**
     * Converts the internal EMON structure back to a JSON object (JS object/array).
     * @returns The chainable instance.
     */
    public toJSON(): this {
        if (!this.context.emonData) {
            throw new Error("Conversion Error: Cannot call toJSON without first converting from an input format.");
        }
        this.context.targetFormat = 'json';

        // Get the last known EMON string output (from the last 'fromJSON' or 'toEMON' step)
        const emonString = toJsonString(this.context.outputData); 
        
        const { jsonData } = emonToJSON(emonString);

        this.context.outputData = jsonData; // Store the resulting JS object/array
        return this;
    }

    /**
     * Ensures the internal state is ready to output an EMON string.
     * @returns The chainable instance.
     */
    public toEMON(): this {
        // If coming from JSON -> EMON, the outputData is already the EMON string.
        this.context.targetFormat = 'emon';
        return this;
    }


    // --- METADATA AND VALUE RETRIEVAL ---
    
    /**
     * Utility to reconstruct the EMON string from the internal parsed structure (emonData).
     * This is used when calculating metrics when the output is JSON (JSON -> EMON -> JSON).
     * @returns The reconstructed EMON string.
     */
    private reconstructEmonString(): string {
        if (!this.context.emonData) return '';

        const schemaLines = Object.values(this.context.emonData.schema).map(type => {
            let line = `#${type.name}(${type.fields.map(f => `${f.name}:${f.type}`).join(',')})`;
            if (type.isArray) line += '[]';
            return line;
        }).join('\n');

        // Note: Full reconstruction requires the private serializeRecord/serializeValue logic 
        // For efficiency comparison, a simple best-effort data line serialization is sufficient here.
        const dataLines = this.context.emonData.records.map(record => {
            return '=' + Object.values(record).map(serializePrimitive).join(','); 
        }).join('\n');

        return schemaLines + '\n' + dataLines;
    }


    /**
     * Calculates and returns the metadata (char count, size, efficiency) of the primary conversion (JSON -> EMON).
     * @param unit The unit for size calculation (KB default).
     * @returns MetaData object.
     */
    public meta(unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB'): MetaData {
        if (!this.context.emonData || !this.context.sourceFormat) {
            throw new Error("Metadata Error: Cannot calculate metrics before a 'from' operation (e.g., fromJSON()).");
        }

        // We use the primary conversion (JSON Input vs. EMON Output) for efficiency metrics.
        const originalInputString = toJsonString(this.context.inputData);
        const emonOutputString = this.reconstructEmonString();

        return generateMetaData(originalInputString, emonOutputString, unit);
    }

    /**
     * Returns the output data along with the metadata.
     * @param unit The unit for size calculation (KB default).
     * @returns Object containing the final data and metadata.
     */
    public withMeta(unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB'): { [key: string]: any, meta: MetaData } {
        const metaData = this.meta(unit);
        const formatKey = this.context.targetFormat || 'data';
        
        return {
            [formatKey]: this.context.outputData,
            meta: metaData,
        };
    }

    /**
     * Returns the final converted data.
     * @returns The resulting data object/string.
     */
    public value(): string | object {
        return this.context.outputData;
    }
}

// --- PUBLIC API ---

/**
 * Public interface for the EMON library.
 */
export const EMON = {
    /**
     * Initiates the conversion chain from a JSON string or object.
     */
    fromJSON: (jsonData: any, schemaName?: string): EMONChain => {
        const chain = new EMONChain(jsonData, 'json');
        return chain.fromJSON(jsonData, schemaName);
    },
    
    /**
     * Helper to convert EMON string to JSON object directly (non-chainable).
     */
    toJSON: (emonStr: string): EmonDataRecord | EmonDataRecord[] => {
        return emonToJSON(emonStr).jsonData;
    },

    /**
     * Creates a chainable instance from an EMON string (reserved for EMON manipulation flows).
     */
    parse: (emonStr: string): EMONChain => {
        const { jsonData, emonSchema, rootTypeName } = emonToJSON(emonStr);
        const chain = new EMONChain(emonStr, 'emon');
        
        // Populate the internal EMON structure
        chain['context'].emonData = {
            schema: emonSchema,
            records: Array.isArray(jsonData) ? jsonData : [jsonData],
            rootTypeName: rootTypeName
        };
        chain['context'].outputData = jsonData; // Set initial output to JSON object
        return chain;
    },
    
    // Future: fromYML
    // Future: fromXML
};