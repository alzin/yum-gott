/**
 * Utility functions for timestamp format handling
 */

/**
 * Normalizes various timestamp formats to ISO 8601 format
 * @param timestamp - The timestamp string in various formats
 * @returns Normalized ISO 8601 timestamp string
 */
export function normalizeTimestamp(timestamp: string): string {
    let normalized = timestamp;

    // Handle various timestamp formats
    if (timestamp.includes(' ') && timestamp.includes('+')) {
        // Format: "2025-07-30 12:45:26.031+00" -> "2025-07-30T12:45:26.031Z"
        normalized = timestamp.replace(' ', 'T').replace('+00', 'Z');
    } else if (timestamp.includes(' ') && timestamp.includes('-')) {
        // Format: "2025-07-30 12:45:26.031-03:00" -> "2025-07-30T12:45:26.031-03:00"
        normalized = timestamp.replace(' ', 'T');
    } else if (timestamp.includes(' ') && !timestamp.includes('+') && !timestamp.includes('-')) {
        // Format: "2025-07-30 12:45:26.031" -> "2025-07-30T12:45:26.031Z"
        normalized = timestamp.replace(' ', 'T') + 'Z';
    } else if (!timestamp.includes('T') && !timestamp.includes(' ')) {
        // Format: "2025-07-30" -> "2025-07-30T00:00:00.000Z"
        normalized = timestamp + 'T00:00:00.000Z';
    }

    return normalized;
}

/**
 * Validates if a timestamp string is valid
 * @param timestamp - The timestamp string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimestamp(timestamp: string): boolean {
    try {
        const normalized = normalizeTimestamp(timestamp);
        const date = new Date(normalized);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
}

/**
 * Supported timestamp formats:
 * - ISO 8601: "2025-07-30T12:45:26.031Z"
 * - ISO 8601 with space: "2025-07-30 12:45:26.031Z"
 * - ISO 8601 with timezone offset: "2025-07-30T12:45:26.031+00:00"
 * - ISO 8601 with space and timezone: "2025-07-30 12:45:26.031+00:00"
 * - ISO 8601 with negative timezone: "2025-07-30T12:45:26.031-03:00"
 * - ISO 8601 with space and negative timezone: "2025-07-30 12:45:26.031-03:00"
 * - Date only: "2025-07-30" (assumes 00:00:00.000Z)
 * - Date with time: "2025-07-30 12:45:26.031" (assumes Z timezone)
 */ 