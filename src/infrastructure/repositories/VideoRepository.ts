import { Video } from '@/domain/entities/Videos';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { DatabaseConnection } from '../database/DataBaseConnection';
export class VideoRepository implements IVideoRepository {
    constructor(private db: DatabaseConnection) { }

    async create(video: Video): Promise<Video> {
        const query = `
            INSERT INTO videos (
                id, user_id, public_id, secure_url, phone_number, 
                network, invoice_image, status_video, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            video.id,
            video.userId,
            video.publicId,
            video.secureUrl,
            video.phoneNumber,
            video.network,
            video.invoiceImage,
            video.statusVideo,
            video.createdAt || new Date(),
            video.updatedAt || new Date()
        ];

        const { rows } = await this.db.query(query, values);
        return this.mapRowToVideoEntites(rows[0]);
    }

    async findById(id: string): Promise<Video | null> {
        const query = 'SELECT * FROM videos WHERE id = $1';
        const { rows } = await this.db.query(query, [id]);
        return rows.length > 0 ? this.mapRowToVideoEntites(rows[0]) : null;
    }

    async findByUserId(userId: string): Promise<Video[]> {
        const query = 'SELECT * FROM videos WHERE user_id = $1';
        const { rows } = await this.db.query(query, [userId]);
        return rows.map(this.mapRowToVideoEntites);
    }

    private mapRowToVideoEntites(row: any): Video {
        return {
            id: row.id,
            userId: row.user_id,
            publicId: row.public_id,
            secureUrl: row.secure_url,
            phoneNumber: row.phone_number,
            network: row.network,
            invoiceImage: row.invoice_image,
            statusVideo: row.status_video,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}