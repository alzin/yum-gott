import { Video } from '@/domain/entities/Videos';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { DatabaseConnection } from '../database/DataBaseConnection';
export class VideoRepository implements IVideoRepository {
    constructor(private db: DatabaseConnection) { }

    async create(video: Video): Promise<Video> {
        const query = `
            INSERT INTO videos (
                id, user_id, public_id, secure_url, restaurantName, phone_number, 
                network, invoice_image, status_video, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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

        // Field mapping: domain property -> database column
        const fieldMappings: Record<string, string> = {
            publicId: 'public_id',
            secureUrl: 'secure_url',
            restaurantName: 'restaurantName',
            phoneNumber: 'phone_number',
            network: 'network',
            invoiceImage: 'invoice_image',
            statusVideo: 'status_video'
        };

        // Helper function to add field if defined
        const addFieldIfDefined = (property: keyof Video, dbColumn: string) => {
            if (video[property] !== undefined) {
                fields.push(`${dbColumn} = $${index}`);
                values.push(video[property]);
                index++;
            }
        };

        // Add all defined fields
        Object.entries(fieldMappings).forEach(([property, dbColumn]) => {
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

    async findByUserId(userId: string): Promise<Video[]> {
        const query = 'SELECT * FROM videos WHERE user_id = $1';
        const { rows } = await this.db.query(query, [userId]);
        return rows.map(this.mapRowToVideoEntites);
    }

    async findBySecureUrl(secureUrl: string): Promise<Video | null> {
        const query = 'SELECT * FROM videos WHERE secure_url = $1';
        const { rows } = await this.db.query(query, [secureUrl]);
        return rows.length > 0 ? this.mapRowToVideoEntites(rows[0]) : null;
    }

    private mapRowToVideoEntites(row: any): Video {
        return {
            id: row.id,
            userId: row.user_id,
            publicId: row.public_id,
            secureUrl: row.secure_url,
            restaurantName: row.restaurantName,
            phoneNumber: row.phone_number,
            network: row.network,
            invoiceImage: row.invoice_image,
            statusVideo: row.status_video,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}