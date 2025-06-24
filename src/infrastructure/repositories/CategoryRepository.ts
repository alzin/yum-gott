import { Category } from '@/domain/entities/Category';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { DatabaseConnection } from '../database/DataBaseConnection';

function mapDbCategory(row: any): Category {
    return {
        id: row.id,
        name: row.name,
        restaurantOwnerId: row.restaurant_owner_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

export class CategoryRepository implements ICategoryRepository {
    constructor(private db: DatabaseConnection) { }

    async create(category: Category): Promise<Category> {
        const query = `
            INSERT INTO categories (id, name, restaurant_owner_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            category.id,
            category.name,
            category.restaurantOwnerId,
            category.createdAt,
            category.updatedAt
        ];
        const result = await this.db.query(query, values);
        return mapDbCategory(result.rows[0]);
    }

    async findById(id: string): Promise<Category | null> {
        const query = 'SELECT * FROM categories WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (!result.rows[0]) return null;
        return mapDbCategory(result.rows[0]);
    }

    async findByNameAndRestaurantOwner(name: string, restaurantOwnerId: string): Promise<Category | null> {
        const query = 'SELECT * FROM categories WHERE name = $1 AND restaurant_owner_id = $2';
        const result = await this.db.query(query, [name, restaurantOwnerId]);
        if (!result.rows[0]) return null;
        return mapDbCategory(result.rows[0]);
    }

    async findByRestaurantOwnerId(restaurantOwnerId: string): Promise<Category[]> {
        const query = 'SELECT * FROM categories WHERE restaurant_owner_id = $1 ORDER BY name ASC';
        const result = await this.db.query(query, [restaurantOwnerId]);
        return result.rows.map(mapDbCategory);
    }

    async update(id: string, category: Partial<Category>): Promise<Category> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (category.name) {
            fields.push(`name = $${index++}`);
            values.push(category.name);
        }
        if (category.updatedAt) {
            fields.push(`updated_at = $${index++}`);
            values.push(category.updatedAt);
        }

        values.push(id);
        const query = `
            UPDATE categories
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING *
        `;
        const result = await this.db.query(query, values);
        return mapDbCategory(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM categories WHERE id = $1';
        await this.db.query(query, [id]);
    }
}