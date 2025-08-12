import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import { ICommentRepository } from '@/domain/repositories/ICommentRepository';
import { Comment } from '@/domain/entities/Comment';

export class CommentRepository implements ICommentRepository {
    constructor(private db: DatabaseConnection) { }

    async create(comment: Comment): Promise<Comment> {
        const query = `
            INSERT INTO comments (id, video_id, user_id, user_type, content)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            comment.id || this.db.generateUUID(),
            comment.videoId,
            comment.userId,
            comment.userType,
            comment.content
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToComment(result.rows[0]);
    }

    async findById(id: string): Promise<Comment | null> {
        const query = 'SELECT * FROM comments WHERE id = $1';
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToComment(result.rows[0]);
    }

    async findByVideoId(videoId: string): Promise<Comment[]> {
        const query = `
            SELECT 
                c.*, 
                CASE 
                    WHEN c.user_type = 'customer' THEN cust.name 
                    WHEN c.user_type = 'restaurant_owner' THEN ro.restaurant_name 
                    ELSE NULL 
                END AS user_name
            FROM comments c
            LEFT JOIN customers cust ON c.user_type = 'customer' AND c.user_id = cust.id
            LEFT JOIN restaurant_owners ro ON c.user_type = 'restaurant_owner' AND c.user_id = ro.id
            WHERE c.video_id = $1
            ORDER BY c.created_at DESC
        `;
        const result = await this.db.query(query, [videoId]);

        return result.rows.map((row: any) => this.mapRowToComment(row));
    }

    async findByUserId(userId: string): Promise<Comment[]> {
        const query = 'SELECT * FROM comments WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await this.db.query(query, [userId]);

        return result.rows.map((row: any) => this.mapRowToComment(row));
    }

    async update(id: string, comment: Partial<Comment>): Promise<Comment | null> {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (comment.content !== undefined) {
            fields.push(`content = $${paramCount++}`);
            values.push(comment.content);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE comments 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToComment(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = 'DELETE FROM comments WHERE id = $1';
        const result = await this.db.query(query, [id]);
        return result.rowCount > 0;
    }

    async deleteByUser(userId: string, userType: 'customer' | 'restaurant_owner'): Promise<number> {
        const query = 'DELETE FROM comments WHERE user_id = $1 AND user_type = $2';
        const result = await this.db.query(query, [userId, userType]);
        return result.rowCount || 0;
    }

    async countByVideoId(videoId: string): Promise<number> {
        const query = 'SELECT COUNT(*) FROM comments WHERE video_id = $1';
        const result = await this.db.query(query, [videoId]);
        return parseInt(result.rows[0].count);
    }

    private mapRowToComment(row: any): Comment {
        return {
            id: row.id,
            videoId: row.video_id,
            userId: row.user_id,
            userType: row.user_type,
            userName: row.user_name,
            content: row.content,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
