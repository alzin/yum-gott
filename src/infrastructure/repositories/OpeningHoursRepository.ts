import { OpeningHours } from '@/domain/entities/OpeningHours';
import { IOpeningHoursRepository } from '@/domain/repositories/IOpeningHoursRepository';
import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';

export class OpeningHoursRepository implements IOpeningHoursRepository {
    constructor(private db: DatabaseConnection) { }

    async create(openingHours: OpeningHours): Promise<OpeningHours> {
        const query = `
            INSERT INTO opening_hours (
                id, restaurant_owner_id, day, Working_hours, is_closed, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            openingHours.id,
            openingHours.restaurantOwnerId,
            openingHours.day,
            JSON.stringify(openingHours.Working_hours),
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
        if (openingHours.Working_hours !== undefined) {
            fields.push(`periods = $${index++}`);
            values.push(JSON.stringify(openingHours.Working_hours));
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
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            id: row.id,
            restaurantOwnerId: row.restaurant_owner_id,
            day: row.day,
            Working_hours: row.Working_hours ? JSON.parse(row.Working_hours) : [],
            isClosed: row.is_closed,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async findByRestaurantOwnerId(restaurantOwnerId: string): Promise<OpeningHours[]> {
        const query = 'SELECT * FROM opening_hours WHERE restaurant_owner_id = $1 ORDER BY day';
        const result = await this.db.query(query, [restaurantOwnerId]);
        return result.rows.map((row: any) => ({
            ...row,
            Working_hours: row.Working_hours ? JSON.parse(row.Working_hours) : []
        }));
    }
    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM opening_hours WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async findByDayAndRestaurantOwnerId(day: string, restaurantOwnerId: string): Promise<OpeningHours | null> {
        const query = 'SELECT * FROM opening_hours WHERE day = $1 AND restaurant_owner_id = $2';
        const result = await this.db.query(query, [day, restaurantOwnerId]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            ...row,
            periods: JSON.parse(row.periods)
        };
    }

    async hasOpeningHoursForDay(restaurantOwnerId: string, day: string): Promise<boolean> {
        const query = 'SELECT 1 FROM opening_hours WHERE restaurant_owner_id = $1 AND day = $2 LIMIT 1';
        const result = await this.db.query(query, [restaurantOwnerId, day]);
        return result.rows.length > 0;
    }
}