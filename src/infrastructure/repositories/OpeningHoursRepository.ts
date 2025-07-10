import { OpeningHours } from '@/domain/entities/OpeningHours';
import { IOpeningHoursRepository } from '@/domain/repositories/IOpeningHoursRepository';
import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';

export class OpeningHoursRepository implements IOpeningHoursRepository {
    constructor(private db: DatabaseConnection) {}

    async create(openingHours: OpeningHours): Promise<OpeningHours> {
        const query = `
            INSERT INTO opening_hours (
                id, restaurant_owner_id, day, start_time, end_time, is_closed, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            openingHours.id,
            openingHours.restaurantOwnerId,
            openingHours.day,
            openingHours.startTime || null,
            openingHours.endTime || null,
            openingHours.isClosed,
            openingHours.createdAt,
            openingHours.updatedAt
        ];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async update(id: string, openingHours: Partial<OpeningHours>): Promise<OpeningHours> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (openingHours.day) {
            fields.push(`day = $${index++}`);
            values.push(openingHours.day);
        }
        if (openingHours.startTime !== undefined) {
            fields.push(`start_time = $${index++}`);
            values.push(openingHours.startTime || null);
        }
        if (openingHours.endTime !== undefined) {
            fields.push(`end_time = $${index++}`);
            values.push(openingHours.endTime || null);
        }
        if (openingHours.isClosed !== undefined) {
            fields.push(`is_closed = $${index++}`);
            values.push(openingHours.isClosed);
        }
        fields.push(`updated_at = $${index++}`);
        values.push(new Date());

        values.push(id);
        const query = `
            UPDATE opening_hours
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING *;
        `;
        const result = await this.db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Opening hours not found');
        }
        return result.rows[0];
    }

    async findById(id: string): Promise<OpeningHours | null> {
        const query = 'SELECT * FROM opening_hours WHERE id = $1';
        const result = await this.db.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByRestaurantOwnerId(restaurantOwnerId: string): Promise<OpeningHours[]> {
        const query = 'SELECT * FROM opening_hours WHERE restaurant_owner_id = $1 ORDER BY day';
        const result = await this.db.query(query, [restaurantOwnerId]);
        return result.rows;
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM opening_hours WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async findByDayAndRestaurantOwnerId(day: string, restaurantOwnerId: string): Promise<OpeningHours | null> {
        const query = 'SELECT * FROM opening_hours WHERE day = $1 AND restaurant_owner_id = $2';
        const result = await this.db.query(query, [day, restaurantOwnerId]);
        return result.rows[0] || null;
    }
}