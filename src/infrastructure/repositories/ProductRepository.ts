import { Pool } from 'pg';
import { Product, SizeOption } from '@/domain/entities/Product';
import { IProductRepository } from '@/domain/repositories/IProductRepository';

export class ProductRepository implements IProductRepository {
    constructor(private db: Pool) { }

    async create(product: Product): Promise<Product> {
        const query = `
            INSERT INTO products (id, category_name, product_name, description, price, discount, size_options, image_url, restaurant_owner_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [
            product.id,
            product.categoryName,
            product.productName,
            product.description,
            product.price,
            product.discount || null,
            product.sizeOptions ? JSON.stringify(product.sizeOptions) : null,
            product.imageUrl || null,
            product.restaurantOwnerId,
            product.createdAt,
            product.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapToProduct(result.rows[0]);
    }

    async update(id: string, product: Partial<Product>): Promise<Product> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (product.categoryName) {
            fields.push(`category_name = $${paramIndex++}`);
            values.push(product.categoryName);
        }
        if (product.productName) {
            fields.push(`product_name = $${paramIndex++}`);
            values.push(product.productName);
        }
        if (product.description) {
            fields.push(`description = $${paramIndex++}`);
            values.push(product.description);
        }
        if (product.price !== undefined) {
            fields.push(`price = $${paramIndex++}`);
            values.push(product.price);
        }
        if (product.discount !== undefined) {
            fields.push(`discount = $${paramIndex++}`);
            values.push(product.discount);
        }
        if (product.sizeOptions !== undefined) {
            fields.push(`size_options = $${paramIndex++}`);
            values.push(product.sizeOptions ? JSON.stringify(product.sizeOptions) : null);
        }
        if (product.imageUrl !== undefined) {
            fields.push(`image_url = $${paramIndex++}`);
            values.push(product.imageUrl);
        }
        if (product.updatedAt) {
            fields.push(`updated_at = $${paramIndex++}`);
            values.push(product.updatedAt);
        }

        values.push(id);
        const query = `
            UPDATE products
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }
        return this.mapToProduct(result.rows[0]);
    }

    async findById(id: string): Promise<Product | null> {
        const query = `SELECT * FROM products WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) return null;
        return this.mapToProduct(result.rows[0]);
    }

    async findByRestaurantOwnerId(restaurantOwnerId: string): Promise<Product[]> {
        const query = `SELECT * FROM products WHERE restaurant_owner_id = $1`;
        const result = await this.db.query(query, [restaurantOwnerId]);
        return result.rows.map(this.mapToProduct);
    }

    async checkExistingProductByNameAndRestaurantId(productName: string, restaurantOwnerId: string): Promise<boolean> {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM products
                WHERE product_name = $1 AND restaurant_owner_id = $2
            ) as exists
        `;
        const result = await this.db.query(query, [productName, restaurantOwnerId]);
        return result.rows[0].exists;
    }

    async delete(id: string): Promise<void> {
        const query = `DELETE FROM products WHERE id = $1`;
        await this.db.query(query, [id]);
    }

    private mapToProduct(row: any): Product {
        return {
            id: row.id,
            categoryName: row.category_name,
            productName: row.product_name,
            description: row.description,
            price: parseFloat(row.price),
            discount: row.discount ? parseFloat(row.discount) : undefined,
            sizeOptions: row.size_options ? row.size_options : null,
            imageUrl: row.image_url || null,
            restaurantOwnerId: row.restaurant_owner_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}