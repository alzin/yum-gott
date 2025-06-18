import { Product, SizeOption } from "@/domain/entities/Product";
import { IProductRepository } from "@/domain/repositories";
import { DatabaseConnection } from "../database/DataBaseConnection";
import { injectable } from "tsyringe";

@injectable()
export class ProductRepository implements IProductRepository {
    constructor(private db: DatabaseConnection) { }
    async create(product: Product): Promise<Product> {
        const query = `
            INSERT INTO products (
                id, category, product_name, description, price, discount, 
                add_size, image_url, restaurant_owner_id, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [
            product.id,
            product.category,
            product.productName,
            product.description,
            product.price,
            product.discount,
            product.addSize,
            product.imageUrl,
            product.restaurantOwnerId,
            product.createdAt,
            product.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToProduct(result.rows[0]);
    }
    async findById(id: string): Promise<Product | null> {
        const query = 'SELECT * FROM products WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToProduct(result.rows[0]);
    }
    async findByRestaurantOwnerId(restaurantOwnerId: string): Promise<Product[]> {
        const query = 'SELECT * FROM products WHERE restaurant_owner_id = $1';
        const result = await this.db.query(query, [restaurantOwnerId]);
        return result.rows.map(this.mapRowToProduct);
    }

    async update(id: string, product: Partial<Product>): Promise<Product> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (product.category) {
            fields.push(`category = $${paramCount++}`);
            values.push(product.category);
        }
        if (product.productName) {
            fields.push(`product_name = $${paramCount++}`);
            values.push(product.productName);
        }
        if (product.description) {
            fields.push(`description = $${paramCount++}`);
            values.push(product.description);
        }
        if (product.price !== undefined) {
            fields.push(`price = $${paramCount++}`);
            values.push(product.price);
        }
        if (product.discount !== undefined) {
            fields.push(`discount = $${paramCount++}`);
            values.push(product.discount);
        }
        if (product.addSize !== undefined) {
            fields.push(`add_size = $${paramCount++}`);
            values.push(product.addSize);
        }
        if (product.imageUrl !== undefined) {
            fields.push(`image_url = $${paramCount++}`);
            values.push(product.imageUrl);
        }
        if (product.updatedAt) {
            fields.push(`updated_at = $${paramCount++}`);
            values.push(product.updatedAt);
        }

        if (fields.length === 0) {
            throw new Error('No fields supplied for update');
        }

        values.push(id);
        const query = `
            UPDATE products 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        const result = await this.db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }
        return this.mapRowToProduct(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM products WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async ExistingByNameAndRestaurantId(productName: string, restaurantOwnerId: string): Promise<boolean> {
        const query = 'SELECT 1 FROM products WHERE product_name = $1 AND restaurant_owner_id = $2 LIMIT 1';
        const result = await this.db.query(query, [productName, restaurantOwnerId]);
        return result.rows.length > 0;
    }

    private mapRowToProduct(row: any): Product {
        return {
            id: row.id,
            category: row.category,
            productName: row.product_name,
            description: row.description,
            price: row.price,
            discount: row.discount,
            addSize: row.add_size as SizeOption,
            imageUrl: row.image_url,
            restaurantOwnerId: row.restaurant_owner_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}