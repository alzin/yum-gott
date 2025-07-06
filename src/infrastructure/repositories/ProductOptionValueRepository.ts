import { DatabaseConnection } from '../database/DataBaseConnection';
import { ProductOptionValue } from '@/domain/entities/ProductOptionValue';
import { IProductOptionValueRepository } from '@/domain/repositories/IProductOptionValueRepository';

export class ProductOptionValueRepository implements IProductOptionValueRepository {
    constructor(private db: DatabaseConnection) { }

    async create(value: ProductOptionValue): Promise<ProductOptionValue> {
        const query = `
            INSERT INTO product_option_values (id, option_id, name, additional_price, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [value.id, value.optionId, value.name, value.additionalPrice, value.createdAt, value.updatedAt];
        const result = await this.db.query(query, values);
        return this.mapRowToProductOptionValue(result.rows[0]);
    }

    async findById(valueId: string): Promise<ProductOptionValue | null> {
        const query = 'SELECT * FROM product_option_values WHERE id = $1';
        const result = await this.db.query(query, [valueId]);
        return result.rows.length > 0 ? this.mapRowToProductOptionValue(result.rows[0]) : null;
    }

    async findByOptionId(optionId: string): Promise<ProductOptionValue[]> {
        const query = 'SELECT * FROM product_option_values WHERE option_id = $1';
        const result = await this.db.query(query, [optionId]);
        return result.rows.map(this.mapRowToProductOptionValue);
    }

    async delete(valueId: string): Promise<void> {
        const query = 'DELETE FROM product_option_values WHERE id = $1';
        await this.db.query(query, [valueId]);
    }

    async update(valueId: string, updates: Partial<ProductOptionValue>): Promise<ProductOptionValue> {
        const setClause: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.name !== undefined) {
            setClause.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.additionalPrice !== undefined) {
            setClause.push(`additional_price = $${paramIndex++}`);
            values.push(updates.additionalPrice);
        }
        if (updates.updatedAt !== undefined) {
            setClause.push(`updated_at = $${paramIndex++}`);
            values.push(updates.updatedAt);
        }

        if (setClause.length === 0) {
            throw new Error('No updates provided');
        }

        values.push(valueId);
        const query = `
            UPDATE product_option_values 
            SET ${setClause.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Product option value not found');
        }

        return this.mapRowToProductOptionValue(result.rows[0]);
    }

    private mapRowToProductOptionValue(row: any): ProductOptionValue {
        return {
            id: row.id,
            optionId: row.option_id,
            name: row.name,
            additionalPrice: row.additional_price,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}