export interface CursorData {
    created_at: string;
    id: string;
}

/**
 * Encodes cursor data into a single string for pagination
 */
export function encodeCursor(createdAt: Date, id: string): string {
    return `${createdAt.toISOString()}_${id}`;
}

/**
 * Decodes a cursor string back into cursor data
 */
export function decodeCursor(cursor: string): CursorData | null {
    try {
        const parts = cursor.split('_');
        if (parts.length < 2) {
            return null;
        }

        // Reconstruct the created_at part (it might contain underscores)
        const id = parts[parts.length - 1];
        const created_at = parts.slice(0, -1).join('_');

        // Validate that created_at is a valid ISO date
        const date = new Date(created_at);
        if (isNaN(date.getTime())) {
            return null;
        }

        return {
            created_at,
            id
        };
    } catch (error) {
        return null;
    }
}

/**
 * Validates if a cursor string is properly formatted
 */
export function isValidCursor(cursor: string): boolean {
    return decodeCursor(cursor) !== null;
} 