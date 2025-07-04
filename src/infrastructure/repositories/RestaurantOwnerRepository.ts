import { RestaurantOwner } from "@/domain/entities/User";
import { IRestaurantOwnerRepository } from "@/domain/repositories/IRestaurantOwnerRepository";
import { DatabaseConnection } from "../database/DataBaseConnection";

export class RestaurantOwnerRepository implements IRestaurantOwnerRepository {
    constructor(private db: DatabaseConnection) {}

    async create(restaurantOwner: RestaurantOwner): Promise<RestaurantOwner> {
        const query = `
            INSERT INTO restaurant_owners (
                restaurant_name, organization_number, email, mobile_number, password, 
                is_active, is_email_verified, verification_token, token_expires_at, 
                profile_image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const values = [
            restaurantOwner.restaurantName,
            restaurantOwner.organizationNumber,
            restaurantOwner.email,
            restaurantOwner.mobileNumber,
            restaurantOwner.password,
            restaurantOwner.isActive,
            restaurantOwner.isEmailVerified,
            restaurantOwner.verificationToken,
            restaurantOwner.tokenExpiresAt,
            restaurantOwner.profileImageUrl
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async verifyEmail(token: string): Promise<RestaurantOwner> {
        const query = `
            UPDATE restaurant_owners 
            SET is_email_verified = true, verification_token = NULL, token_expires_at = NULL
            WHERE verification_token = $1 
            AND token_expires_at > CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await this.db.query(query, [token]);
        
        if (result.rows.length === 0) {
            throw new Error('Invalid or expired verification token');
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
        if (restaurantOwner.isEmailVerified !== undefined) {
            fields.push(`is_email_verified = $${paramCount++}`);
            values.push(restaurantOwner.isEmailVerified);
        }
        if (restaurantOwner.verificationToken !== undefined) {
            fields.push(`verification_token = $${paramCount++}`);
            values.push(restaurantOwner.verificationToken);
        }
        if (restaurantOwner.tokenExpiresAt !== undefined) {
            fields.push(`token_expires_at = $${paramCount++}`);
            values.push(restaurantOwner.tokenExpiresAt);
        }
        if (restaurantOwner.profileImageUrl !== undefined) {
            fields.push(`profile_image_url = $${paramCount++}`);
            values.push(restaurantOwner.profileImageUrl);
        }
        if (restaurantOwner.address !== undefined) {
            fields.push(`address = $${paramCount++}`);
            values.push(restaurantOwner.address);
        }
        if (restaurantOwner.latitude !== undefined) {
            fields.push(`latitude = $${paramCount++}`);
            values.push(restaurantOwner.latitude);
        }
        if (restaurantOwner.longitude !== undefined) {
            fields.push(`longitude = $${paramCount++}`);
            values.push(restaurantOwner.longitude);
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

    async updateProfileImage(id: string, profileImageUrl: string): Promise<RestaurantOwner> {
        const query = `
            UPDATE restaurant_owners 
            SET profile_image_url = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.db.query(query, [profileImageUrl, id]);
        if (result.rows.length === 0) {
            throw new Error('Restaurant owner not found');
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async updateLocation(id: string, location: { address: string; latitude: number; longitude: number }): Promise<RestaurantOwner> {
        const query = `
            UPDATE restaurant_owners 
            SET address = $1, latitude = $2, longitude = $3
            WHERE id = $4
            RETURNING *
        `;
        const result = await this.db.query(query, [location.address, location.latitude, location.longitude, id]);
        if (result.rows.length === 0) {
            throw new Error('Restaurant owner not found');
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM restaurant_owners WHERE id = $1';
        await this.db.query(query, [id]);
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

    async deleteUnverifiedOlderThan(date: Date): Promise<number> {
        const query = `
            DELETE FROM restaurant_owners 
            WHERE is_email_verified = false 
            AND created_at < $1
            RETURNING id
        `;
        const result = await this.db.query(query, [date]);
        return result.rowCount;
    }

    async getRestaurantOwnerProfile(id: string): Promise<{ restaurantName: string; profileImageUrl: string | null }> {
        const query = `
            SELECT restaurant_name as "restaurantName", profile_image_url as "profileImageUrl"
            FROM restaurant_owners
            WHERE id = $1
        `;
        const result = await this.db.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Restaurant owner not found');
        }
        
        return result.rows[0];
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
            isEmailVerified: row.is_email_verified,
            verificationToken: row.verification_token,
            tokenExpiresAt: row.token_expires_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            profileImageUrl: row.profile_image_url,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude
        };
    }
}
