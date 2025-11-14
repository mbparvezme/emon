/**
 * Validates the provided schema name against EMON rules.
 * Rules:
 * 1. Must not be empty.
 * 2. Must contain only characters, numbers, and underscores (/[A-Za-z0-9_]/).
 * 3. Cannot start with a number.
 * @param name The schema name to validate.
 * @returns True if valid, false otherwise.
 */
export const validateSchemaName = (name: string): boolean => {
    if (!name || name.trim() === '') {
        return false;
    }

    // Rule 2: Must contain only valid characters
    if (!/^[A-Za-z0-9_]+$/.test(name)) {
        return false;
    }

    // Rule 3: Cannot start with a number
    if (/^[0-9]/.test(name)) {
        return false;
    }

    return true;
};