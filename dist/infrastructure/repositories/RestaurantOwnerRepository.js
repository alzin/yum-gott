"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOwnerRepository = void 0;
class RestaurantOwnerRepository {
    constructor(db) {
        this.db = db;
    }
    async create(restaurantOwner) {
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
    async createPending(pendingUser) {
        const query = `
            INSERT INTO pending_users (
                restaurant_name, organization_number, email, mobile_number, password, user_type, verification_token, token_expires_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        const values = [
            pendingUser.restaurantName,
            pendingUser.organizationNumber,
            pendingUser.email,
            pendingUser.mobileNumber,
            pendingUser.password,
            pendingUser.userType,
            pendingUser.verificationToken,
            pendingUser.tokenExpiresAt
        ];
        await this.db.query(query, values);
    }
    async verifyEmail(token) {
        const findQuery = `
            SELECT * FROM pending_users 
            WHERE verification_token = $1 
            AND user_type = 'restaurant_owner'
            AND token_expires_at > CURRENT_TIMESTAMP
        `;
        const result = await this.db.query(findQuery, [token]);
        if (result.rows.length === 0) {
            throw new Error('Invalid or expired verification token');
        }
        const pendingUser = result.rows[0];
        const restaurantOwner = {
            restaurantName: pendingUser.restaurant_name,
            organizationNumber: pendingUser.organization_number,
            email: pendingUser.email,
            mobileNumber: pendingUser.mobile_number,
            password: pendingUser.password,
            isActive: true
        };
        const createdOwner = await this.create(restaurantOwner);
        // Delete from pending_users
        await this.db.query('DELETE FROM pending_users WHERE verification_token = $1', [token]);
        return createdOwner;
    }
    async findByMobileNumber(mobileNumber) {
        const query = 'SELECT * FROM restaurant_owners WHERE mobile_number = $1';
        const result = await this.db.query(query, [mobileNumber]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }
    async findById(id) {
        const query = 'SELECT * FROM restaurant_owners WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }
    async findByEmail(email) {
        const query = 'SELECT * FROM restaurant_owners WHERE email = $1';
        const result = await this.db.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToRestaurantOwner(result.rows[0]);
    }
    async update(id, restaurantOwner) {
        const fields = [];
        const values = [];
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
    async delete(id) {
        const query = 'DELETE FROM restaurant_owners WHERE id = $1';
        await this.db.query(query, [id]);
    }
    async existsByMobileNumber(mobileNumber) {
        const query = 'SELECT 1 FROM restaurant_owners WHERE mobile_number = $1 LIMIT 1';
        const result = await this.db.query(query, [mobileNumber]);
        return result.rows.length > 0;
    }
    async existsByEmail(email) {
        const query = 'SELECT 1 FROM restaurant_owners WHERE email = $1 LIMIT 1';
        const result = await this.db.query(query, [email]);
        return result.rows.length > 0;
    }
    async existsByOrganizationNumber(organizationNumber) {
        const query = 'SELECT 1 FROM restaurant_owners WHERE organization_number = $1 LIMIT 1';
        const result = await this.db.query(query, [organizationNumber]);
        return result.rows.length > 0;
    }
    mapRowToRestaurantOwner(row) {
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
exports.RestaurantOwnerRepository = RestaurantOwnerRepository;
