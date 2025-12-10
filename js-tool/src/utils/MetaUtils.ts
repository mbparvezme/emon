import { MetaData, Metrics } from "../types";

// Helper function to convert string to bytes (UTF-8 encoding)
const getBytes = (str: string): number => {
    // Use TextEncoder for accurate byte count based on UTF-8 encoding
    return new TextEncoder().encode(str).length;
};

// Helper function to format bytes into KB, MB, etc.
const formatSize = (bytes: number, unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB'): string => {
    if (unit === 'B') return `${bytes} B`;
    if (unit === 'KB') return `${(bytes / 1024).toFixed(2)} KB`;
    if (unit === 'MB') return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    if (unit === 'GB') return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    return `${bytes} B`; // Default fallback
};

/**
 * Calculates the character count and size in bytes for a given string.
 * @param dataString The string content (e.g., JSON or EMON).
 * @param unit The size unit ('KB' by default).
 * @returns Metrics object.
 */
export const calculateMetrics = (dataString: string, unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB'): Metrics => {
    const chars = dataString.length;
    const bytes = getBytes(dataString);
    const size = formatSize(bytes, unit);
    return { chars, size };
};

/**
 * Generates the full MetaData object by comparing input and output strings.
 * Efficiency is based on character count comparison, as requested.
 * @param inputString The input data string.
 * @param outputString The output data string.
 * @param unit The size unit ('KB' by default).
 * @returns MetaData object.
 */
export const generateMetaData = (inputString: string, outputString: string, unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB'): MetaData => {
    const inputMetrics = calculateMetrics(inputString, unit);
    const outputMetrics = calculateMetrics(outputString, unit);

    let efficiency = "0.00%";

    if (inputMetrics.chars > 0) {
        // Efficiency = (1 - (Output Size / Input Size)) * 100
        const eff = (1 - (outputMetrics.chars / inputMetrics.chars)) * 100;
        efficiency = eff.toFixed(2) + '%';
    }

    return {
        input: inputMetrics,
        output: outputMetrics,
        efficiency,
    };
};