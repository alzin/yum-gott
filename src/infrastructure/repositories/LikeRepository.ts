import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import { ILikeRepository } from '@/domain/repositories/ILikeRepository';
import { Like } from '@/domain/entities/Like';

export class LikeRepository implements ILikeRepository {
    constructor(private db: DatabaseConnection) { }

    async create(like: Like): Promise<Like> {
        const query = `
            INSERT INTO likes (id, video_id, user_id, user_type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [
            like.id || this.db.generateUUID(),
            like.videoId,
            like.userId,
            like.userType
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToLike(result.rows[0]);
    }

    async findById(id: string): Promise<Like | null> {
        const query = 'SELECT * FROM likes WHERE id = $1';
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToLike(result.rows[0]);
    }

    async findByVideoId(videoId: string): Promise<Like[]> {
        const query = 'SELECT * FROM likes WHERE video_id = $1 ORDER BY created_at DESC';
        const result = await this.db.query(query, [videoId]);

        return result.rows.map((row: any) => this.mapRowToLike(row));
    }

    async findByUserId(userId: string): Promise<Like[]> {
        const query = 'SELECT * FROM likes WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await this.db.query(query, [userId]);

        return result.rows.map((row: any) => this.mapRowToLike(row));
    }

    async findByVideoAndUser(videoId: string, userId: string): Promise<Like | null> {
        const query = 'SELECT * FROM likes WHERE video_id = $1 AND user_id = $2';
        const result = await this.db.query(query, [videoId, userId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToLike(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = 'DELETE FROM likes WHERE id = $1';
        const result = await this.db.query(query, [id]);
        return result.rowCount > 0;
    }

    async deleteByVideoAndUser(videoId: string, userId: string): Promise<boolean> {
        const query = 'DELETE FROM likes WHERE video_id = $1 AND user_id = $2';
        const result = await this.db.query(query, [videoId, userId]);
        return result.rowCount > 0;
    }

    async countByVideoId(videoId: string): Promise<number> {
        const query = 'SELECT COUNT(*) FROM likes WHERE video_id = $1';
        const result = await this.db.query(query, [videoId]);
        return parseInt(result.rows[0].count);
    }

    async existsByVideoAndUser(videoId: string, userId: string): Promise<boolean> {
        const query = 'SELECT EXISTS(SELECT 1 FROM likes WHERE video_id = $1 AND user_id = $2)';
        const result = await this.db.query(query, [videoId, userId]);
        return result.rows[0].exists;
    }

    private mapRowToLike(row: any): Like {
        return {
            id: row.id,
            videoId: row.video_id,
            userId: row.user_id,
            userType: row.user_type,
            createdAt: row.created_at
        };
    }
}
