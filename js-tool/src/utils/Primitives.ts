import { EmonPrimitiveType } from "../types";

// --- QUOTING LOGIC ---

/**
 * Checks if a string contains characters that require double quotes in EMON.
 * Needs quotes if it contains spaces, commas, or structural delimiters ({}[]:).
 * We must also quote if it starts with a number (to prevent ambiguity with the number type)
 * or if it matches 'true'/'false'/'null' (to prevent ambiguity with the keyword type)
 * @param s The string value.
 * @returns boolean
 */
export const needsQuote = (s: string): boolean => {
    if (s.trim().length === 0) return true;
    // Check for delimiters, spaces, or internal quotes that need escaping (Rule 4)
    if (/[ \t,:{}[\]()@=;/\\]/.test(s)) return true;

    // Check for boolean or null values which should be treated as keywords if unquoted
    // This ensures if the user actually typed "null" as a string, it gets quoted.
    if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false' || s.toLowerCase() === 'null') return true;

    // Check if it starts with a number or sign, preventing accidental number parsing
    // It must not look like a complete number if it contains non-numeric/dot characters (preventing "12a")
    if (/^[\d+-]/.test(s) && !/^\d+(\.\d*)?$/.test(s)) return true;

    return false;
};

/**
 * Checks if a string is a multi-line string (surrounded by """...""").
 * @param str The string value.
 * @returns boolean
 */
export const isTripleQuoted = (str: string): boolean => {
    return str.startsWith('"""') && str.endsWith('"""');
};

/**
 * Removes quotes from a string, handling both double-quotes and triple-quotes.
 * Handles backslash escaping within strings.
 * @param str The EMON string representation (may include quotes).
 * @returns The unquoted string value.
 */
export const unquote = (str: string): string => {
    if (isTripleQuoted(str)) {
        // Remove triple quotes and return content
        return str.slice(3, -3);
    }
    if (str.startsWith('"') && str.endsWith('"')) {
        // Remove double quotes and un-escape internal quotes
        return str.slice(1, -1).replace(/\\"/g, '"');
    }
    return str; // Return as-is if no quotes found (e.g., unquoted primitives)
};

/**
 * Converts a primitive JavaScript value to its EMON string representation.
 * Applies strict quoting, escaping, and multi-line rules.
 * @param val The JS value.
 * @returns The EMON string representation.
 */
export const serializePrimitive = (val: any): string => {
    // CRITICAL: Handle null/undefined using the 'null' keyword (Explicit Null Support)
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return String(val);

    if (typeof val === 'string') {
        // Rule 9: Multi-line strings use triple quotes
        if (val.includes('\n')) {
            // Triple quotes handle escaping automatically but ensure no internal """ exists
            const safeVal = val.replace(/"""/g, '\\"\\"\\"'); // Escape internal triple quotes if necessary
            // Format with newlines for clarity (optional but good practice)
            return `"""\n${safeVal}\n"""`;
        }

        // Rule 4: Handle single-line strings
        const escaped = val.replace(/"/g, '\\"');

        // Rule 4/11: Quote if needed based on the needsQuote logic
        return needsQuote(val) ? `"${escaped}"` : val;
    }

    // Fallback for non-primitive types not handled elsewhere (shouldn't happen in JSON->EMON)
    return String(val);
};

// --- PARSING UTILITIES ---

/**
 * Quote-aware top-level splitter for EMON records and structures.
 * This is crucial for correctly parsing comma-separated values, arrays, and objects.
 * Handles nested {}, [], (), and quoted strings (including triple quotes).
 * @param str The EMON string to split.
 * @param delimiter The character to split by (default: ',').
 * @returns An array of top-level segmented strings.
 */
export const splitTopLevel = (str: string | undefined | null, delimiter: string = ','): string[] => {
    if (str === undefined || str === null) return [];
    str = String(str).trim();
    if (str.length === 0) return [];

    const out: string[] = [];
    let buf = '';
    let depth = 0; // Tracks nesting level for {}, [], and ()
    let inQuote = false;
    let inTripleQuote = false;

    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        const nextTwo = str.substring(i + 1, i + 3);
        const prev = str[i - 1];

        // 1. Triple Quote Handling (Rule 9) - Check for " or \"
        if (ch === '"' && nextTwo === '""' && prev !== '\\') {
            // Check for the start/end of """ (3 quotes)
            if (!inQuote) {
                inTripleQuote = !inTripleQuote;
                buf += '"""';
                i += 2; // Skip the next two quotes
                continue;
            }
        }

        // 2. Double Quote Handling (Rule 4)
        if (ch === '"' && prev !== '\\' && !inTripleQuote) {
            inQuote = !inQuote;
        }

        // 3. Delimiter and Depth Handling
        if (!inQuote && !inTripleQuote) {
            // Rule 6: Track structural depth
            if (ch === '{' || ch === '[' || ch === '(') depth++;
            else if (ch === '}' || ch === ']' || ch === ')') depth--;

            // Rule 6/11: Check for delimiter at depth 0
            if (ch === delimiter && depth === 0) {
                out.push(buf);
                buf = '';
                continue;
            }
        }

        // Append current character to buffer
        buf += ch;
    }

    // Push the final buffer segment
    if (buf !== '') out.push(buf);

    // Rule 5: Trim leading/trailing whitespace after splitting, but not within quotes
    return out.map(s => s.trim());
};