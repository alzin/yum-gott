import { RestaurantOwner } from "@/domain/entities/User";
import { IRestaurantOwnerRepository } from "@/domain/repositories/IRestaurantOwnerRepository";
import { DatabaseConnection } from "../database/DataBaseConnection";

export class RestaurantOwnerRepository implements IRestaurantOwnerRepository {
    constructor(private db: DatabaseConnection) {}

    async create(restaurantOwner: RestaurantOwner): Promise<RestaurantOwner> {
        const query = `
            INSERT INTO restaurant_owners (
                restaurant_name, organization_number, email, mobile_number, password, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            restaurantOwner.restaurantName,
            restaurantOwner.organizationNumber,
            restaurantOwner.email,
            restaurantOwner.mobileNumber,
            restaurantOwner.password,
            restaurantOwner.isActive
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async findByMobileNumber(mobileNumber: string): Promise<RestaurantOwner | null> {
        const query = 'SELECT * FROM restaurant_owners WHERE mobile_number = $1';
        const result = await this.db.query(query, [mobileNumber]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async findById(id: string): Promise<RestaurantOwner | null> {
        const query = 'SELECT * FROM restaurant_owners WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async findByEmail(email: string): Promise<RestaurantOwner | null> {
        const query = 'SELECT * FROM restaurant_owners WHERE email = $1';
        const result = await this.db.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async update(id: string, restaurantOwner: Partial<RestaurantOwner>): Promise<RestaurantOwner> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (restaurantOwner.restaurantName) {
            fields.push(`restaurant_name = $${paramCount++}`);
            values.push(restaurantOwner.restaurantName);
        }
        if (restaurantOwner.organizationNumber) {
            fields.push(`organization_number = $${paramCount++}`);
            values.push(restaurantOwner.organizationNumber);
        }
        if (restaurantOwner.email) {
            fields.push(`email = $${paramCount++}`);
            values.push(restaurantOwner.email);
        }
        if (restaurantOwner.mobileNumber) {
            fields.push(`mobile_number = $${paramCount++}`);
            values.push(restaurantOwner.mobileNumber);
        }
        if (restaurantOwner.password) {
            fields.push(`password = $${paramCount++}`);
            values.push(restaurantOwner.password);
        }
        if (restaurantOwner.isActive !== undefined) {
            fields.push(`is_active = $${paramCount++}`);
            values.push(restaurantOwner.isActive);
        }

        values.push(id);
        const query = `
            UPDATE restaurant_owners 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM restaurant_owners WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async existsByMobileNumber(mobileNumber: string): Promise<boolean> {
        const query = 'SELECT 1 FROM restaurant_owners WHERE mobile_number = $1 LIMIT 1';
        const result = await this.db.query(query, [mobileNumber]);
        return result.rows.length > 0;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const query = 'SELECT 1 FROM restaurant_owners WHERE email = $1 LIMIT 1';
        const result = await this.db.query(query, [email]);
        return result.rows.length > 0;
    }

    async existsByOrganizationNumber(organizationNumber: string): Promise<boolean> {
        const query = 'SELECT 1 FROM restaurant_owners WHERE organization_number = $1 LIMIT 1';
        const result = await this.db.query(query, [organizationNumber]);
        return result.rows.length > 0;
    }

    private mapRowToRestaurantOwner(row: any): RestaurantOwner {
        return {
            id: row.id,
            restaurantName: row.restaurant_name,
            organizationNumber: row.organization_number,
            email: row.email,
            mobileNumber: row.mobile_number,
            password: row.password,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
