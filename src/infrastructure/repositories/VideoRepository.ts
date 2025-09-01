import { Video, VideoStatus } from '@/domain/entities/Videos';
import { IVideoRepository, PaginationParams, PaginatedVideosResult } from '@/domain/repositories/IVideoRepository';
import { DatabaseConnection } from '../database/DataBaseConnection';
import { decodeCursor, encodeCursor } from '@/shared/utils/cursorUtils';

// Common field mappings for database column names
const VIDEO_FIELD_MAPPINGS: Record<string, string> = {
    publicId: 'public_id',
    secureUrl: 'secure_url',
    restaurantName: 'restaurantname',
    phoneNumber: 'phone_number',
    network: 'network',
    invoiceImage: 'invoice_image',
    statusVideo: 'status_video',
    likesCount: 'likes_count'
};

export class VideoRepository implements IVideoRepository {
    constructor(private db: DatabaseConnection) { }

    async create(video: Video): Promise<Video> {
        const query = `
            INSERT INTO videos (
                id, user_id, public_id, secure_url, restaurantname, phone_number, 
                network, invoice_image, status_video, likes_count, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const values = [
            video.id,
            video.userId,
            video.publicId,
            video.secureUrl,
            video.restaurantName,
            video.phoneNumber,
            video.network,
            video.invoiceImage,
            video.statusVideo,
            video.likesCount || 0,
            video.createdAt || new Date(),
            video.updatedAt || new Date()
        ];

        const { rows } = await this.db.query(query, values);
        return this.mapRowToVideoEntites(rows[0]);
    }

    async update(id: string, video: Partial<Video>): Promise<Video> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        // Helper function to add field if defined
        const addFieldIfDefined = (property: keyof Video, dbColumn: string) => {
            if (video[property] !== undefined) {
                fields.push(`${dbColumn} = $${index}`);
                values.push(video[property]);
                index++;
            }
        };

        // Add all defined fields using the common mappings
        Object.entries(VIDEO_FIELD_MAPPINGS).forEach(([property, dbColumn]) => {
            addFieldIfDefined(property as keyof Video, dbColumn);
        });

        // Always update timestamp
        fields.push(`updated_at = $${index}`);
        values.push(new Date());
        index++;

        // Add id for WHERE clause
        values.push(id);

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE videos 
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING *
        `;

        const { rows } = await this.db.query(query, values);

        if (rows.length === 0) {
            throw new Error('Video not found for update');
        }

        return this.mapRowToVideoEntites(rows[0]);
    }

    async findById(id: string): Promise<Video | null> {
        const query = 'SELECT * FROM videos WHERE id = $1';
        const { rows } = await this.db.query(query, [id]);
        return rows.length > 0 ? this.mapRowToVideoEntites(rows[0]) : null;
    }

    async findByStatusVideoPaginated(status: VideoStatus, pagination: PaginationParams): Promise<PaginatedVideosResult> {
        const { limit = 10, cursor, cursor_created, cursor_id } = pagination;
        const offset = limit + 1; // Fetch one extra to check if there are more results

        let query: string;
        let values: any[];

        // Handle legacy cursor format for backward compatibility
        let finalCursorCreated = cursor_created;
        let finalCursorId = cursor_id;

        if (cursor && !cursor_created && !cursor_id) {
            const decodedCursor = decodeCursor(cursor);
            if (decodedCursor) {
                finalCursorCreated = decodedCursor.created_at;
                finalCursorId = decodedCursor.id;
            }
        }

        if (finalCursorCreated && finalCursorId) {
            // If both cursors are provided, get videos after the cursor
            query = `
                SELECT * FROM videos 
                WHERE status_video = $1 
                AND (created_at, id) < ($2, $3)
                ORDER BY created_at DESC, id DESC 
                LIMIT $4
            `;
            values = [status, finalCursorCreated, finalCursorId, offset];
        } else if (finalCursorCreated) {
            // If only created_at cursor is provided
            query = `
                SELECT * FROM videos 
                WHERE status_video = $1 
                AND created_at < $2
                ORDER BY created_at DESC, id DESC 
                LIMIT $3
            `;
            values = [status, finalCursorCreated, offset];
        } else {
            // If no cursor, get the first page
            query = `
                SELECT * FROM videos 
                WHERE status_video = $1 
                ORDER BY created_at DESC, id DESC 
                LIMIT $2
            `;
            values = [status, offset];
        }

        const { rows } = await this.db.query(query, values);

        const hasMore = rows.length > limit;
        const videos = rows.slice(0, limit).map(this.mapRowToVideoEntites);

        let nextCursor: string | undefined;
        if (hasMore && videos.length > 0) {
            const lastVideo = videos[videos.length - 1];
            nextCursor = encodeCursor(lastVideo.createdAt, lastVideo.id);
        }

        return {
            videos,
            nextCursor,
            hasMore
        };
    }

    async findBySecureUrl(secureUrl: string): Promise<Video | null> {
        const query = 'SELECT * FROM videos WHERE secure_url = $1';
        const { rows } = await this.db.query(query, [secureUrl]);
        return rows.length > 0 ? this.mapRowToVideoEntites(rows[0]) : null;
    }

    async findByCustomerIdAndStatus(customerId: string, status: VideoStatus): Promise<Video[]> {
        const query = 'SELECT * FROM videos WHERE user_id = $1 AND status_video = $2 ORDER BY created_at DESC';
        const { rows } = await this.db.query(query, [customerId, status]);
        return rows.map(this.mapRowToVideoEntites);
    }

    async findAllAcceptedVideos(): Promise<Video[]> {
        const query = 'SELECT * FROM videos WHERE status_video = $1 ORDER BY created_at DESC';
        const { rows } = await this.db.query(query, [VideoStatus.ACCEPTED]);
        return rows.map(this.mapRowToVideoEntites);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM videos WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async getVideosAfterId(lastSeenVideoId: string | null, limit: number, cursor?: string): Promise<Video[]> {
        let query: string;
        let values: any[] = [];

        let lastSeenCreatedAt: Date | null = null;
        let lastSeenId: string | null = null;
        if (lastSeenVideoId) {
            const lastSeenVideo = await this.findById(lastSeenVideoId);
            if (lastSeenVideo) {
                lastSeenCreatedAt = lastSeenVideo.createdAt as Date;
                lastSeenId = lastSeenVideo.id as string;
            }
        }

        if (cursor) {
            const cursorVideo = await this.findById(cursor);
            if (!cursorVideo) {
                if (lastSeenCreatedAt && lastSeenId) {
                    query = `
                        SELECT * FROM videos
                        WHERE status_video = 'accepted'
                        AND (created_at, id) < ($1, $2)
                        ORDER BY created_at DESC, id DESC
                        LIMIT $3
                    `;
                    values = [lastSeenCreatedAt, lastSeenId, limit];
                } else {
                    query = `
                        SELECT * FROM videos
                        WHERE status_video = 'accepted'
                        ORDER BY created_at DESC, id DESC
                        LIMIT $1
                    `;
                    values = [limit];
                }
            } else {
                query = `
                    SELECT * FROM videos 
                    WHERE status_video = 'accepted'
                    AND (created_at, id) < ($1, $2)
                    ORDER BY created_at DESC, id DESC 
                    LIMIT $3
                `;
                values = [cursorVideo.createdAt, cursorVideo.id, limit];
            }
        } else if (lastSeenCreatedAt && lastSeenId) {
            // First page after last seen: strictly OLDER than last seen
            query = `
                SELECT * FROM videos 
                WHERE status_video = 'accepted'
                AND (created_at, id) < ($1, $2)
                ORDER BY created_at DESC, id DESC 
                LIMIT $3
            `;
            values = [lastSeenCreatedAt, lastSeenId, limit];
        } else {
            // No last seen: return newest first
            query = `
                SELECT * FROM videos 
                WHERE status_video = 'accepted'
                ORDER BY created_at DESC, id DESC 
                LIMIT $1
            `;
            values = [limit];
        }

        const { rows } = await this.db.query(query, values);
        return rows.map(this.mapRowToVideoEntites);
    }

    private mapRowToVideoEntites(row: any): Video {
        return {
            id: row.id,
            userId: row.user_id,
            publicId: row.public_id,
            secureUrl: row.secure_url,
            restaurantName: row.restaurantname,
            phoneNumber: row.phone_number,
            network: row.network,
            invoiceImage: row.invoice_image,
            statusVideo: row.status_video,
            likesCount: row.likes_count || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            acceptAt: row.accept_at
        };
    }
}