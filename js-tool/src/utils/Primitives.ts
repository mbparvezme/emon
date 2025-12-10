import { EmonPrimitiveType } from "../types";

// --- QUOTING LOGIC ---

/**
 * Checks if a string contains characters that require double quotes in EMON.
 * Needs quotes if it contains spaces, commas, or structural delimiters ({}[]:).
 * We must also quote if it starts with a number (to prevent ambiguity with the number type)
 * or if it matches 'true'/'false' (to prevent ambiguity with the bool type)
 * @param s The string value.
 * @returns boolean
 */
export const needsQuote = (s: string): boolean => {
    if (s.trim().length === 0) return true;
    // Check for delimiters, spaces, or internal quotes that need escaping
    // if (/[ \t,:{}[\]()]/.test(s)) return true;
    if (/[ \t,:{}[\]()@=;/\\]/.test(s)) return true;
    // Check for boolean or null values which should be treated as keywords if unquoted
    if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false' || s.toLowerCase() === 'null') return true;
    // Check if it starts with a number or sign, preventing accidental number parsing
    if (/^[\d+-]/.test(s) && !/^\d+(\.\d*)?$/.test(s)) return true;
    // If it contains triple quotes, it should be treated as a regular string that needs quotes for consistency,
    // although triple-quote handling is usually done by the calling function for multiline.
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
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return String(val);

    if (typeof val === 'string') {
        // Rule 9: Multi-line strings use triple quotes
        if (val.includes('\n')) {
            // Triple quotes handle escaping automatically but ensure no internal """ exists
            const safeVal = val.replace(/"""/g, '\"\"\"'); // Escape internal triple quotes if necessary
            return `"""\n${safeVal}\n"""`; // Recommended format with newlines for clarity
        }

        // Rule 4: Handle single-line strings
        // Escape internal double quotes
        const escaped = val.replace(/"/g, '\\"');
        
        // Rule 4/11: Quote if needed
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
        const prev = str[i - 1];

        // 1. Triple Quote Handling (Rule 9)
        if (ch === '"' && str.substring(i, i + 3) === '"""') {
            if (i > 0 && prev === '\\') { // skip escaped quotes
                buf += ch;
                continue;
            }
            if (!inQuote) {
                inTripleQuote = !inTripleQuote;
                i += 2; // Skip the next two quotes
                buf += '"""';
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