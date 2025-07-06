import { DatabaseConnection } from '../database/DataBaseConnection';
import { ProductOption } from '@/domain/entities/ProductOption';
import { IProductOptionRepository } from '@/domain/repositories/IProductOptionRepository';

export class ProductOptionRepository implements IProductOptionRepository {
    constructor(private db: DatabaseConnection) { }

    async create(option: ProductOption): Promise<ProductOption> {
        const query = `
            INSERT INTO product_options (id, product_id, name, required, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [option.id, option.productId, option.name, option.required, option.createdAt, option.updatedAt];
        const result = await this.db.query(query, values);
        return this.mapRowToProductOption(result.rows[0]);
    }

    async findById(optionId: string): Promise<ProductOption | null> {
        const query = 'SELECT * FROM product_options WHERE id = $1';
        const result = await this.db.query(query, [optionId]);
        return result.rows.length > 0 ? this.mapRowToProductOption(result.rows[0]) : null;
    }

    async findByProductId(productId: string): Promise<ProductOption[]> {
        const query = 'SELECT * FROM product_options WHERE product_id = $1';
        const result = await this.db.query(query, [productId]);
        return result.rows.map(this.mapRowToProductOption);
    }

    async delete(optionId: string): Promise<void> {
        const query = 'DELETE FROM product_options WHERE id = $1';
        await this.db.query(query, [optionId]);
    }

    async existsByNameAndProductId(name: string, productId: string): Promise<boolean> {
        const query = 'SELECT 1 FROM product_options WHERE name = $1 AND product_id = $2 LIMIT 1';
        const result = await this.db.query(query, [name, productId]);
        return result.rows.length > 0;
    }

    async update(optionId: string, updates: Partial<ProductOption>): Promise<ProductOption> {
        const setClause: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.name !== undefined) {
            setClause.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.required !== undefined) {
            setClause.push(`required = $${paramIndex++}`);
            values.push(updates.required);
        }
        if (updates.updatedAt !== undefined) {
            setClause.push(`updated_at = $${paramIndex++}`);
            values.push(updates.updatedAt);
        }

        if (setClause.length === 0) {
            throw new Error('No updates provided');
        }

        values.push(optionId);
        const query = `
            UPDATE product_options 
            SET ${setClause.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Product option not found');
        }

        return this.mapRowToProductOption(result.rows[0]);
    }

    private mapRowToProductOption(row: any): ProductOption {
        return {
            id: row.id,
            productId: row.product_id,
            name: row.name,
            required: row.required,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}