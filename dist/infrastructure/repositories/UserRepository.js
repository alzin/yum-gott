"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = require("@/domain/entities/User");
class UserRepository {
    constructor(db) {
        this.db = db;
    }
    async create(user) {
        const query = `
      INSERT INTO users (
        mobile_number, password, user_type, is_active,
        name, email, restaurant_name, organization_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [
            user.mobileNumber,
            user.password,
            user.userType,
            user.isActive,
            user.userType === User_1.UserType.CUSTOMER ? user.name : null,
            // Both customer and restaurant owner can have email now
            user.userType === User_1.UserType.CUSTOMER ? user.email : user.email,
            user.userType === User_1.UserType.RESTAURANT_OWNER ? user.restaurantName : null,
            user.userType === User_1.UserType.RESTAURANT_OWNER ? user.organizationNumber : null
        ];
        const result = await this.db.query(query, values);
        return this.mapRowToUser(result.rows[0]);
    }
    async findByMobileNumber(mobileNumber) {
        const query = 'SELECT * FROM users WHERE mobile_number = $1';
        const result = await this.db.query(query, [mobileNumber]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToUser(result.rows[0]);
    }
    async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToUser(result.rows[0]);
    }
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.db.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToUser(result.rows[0]);
    }
    async update(id, user) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (user.mobileNumber) {
            fields.push(`mobile_number = $${paramCount++}`);
            values.push(user.mobileNumber);
        }
        if (user.password) {
            fields.push(`password = $${paramCount++}`);
            values.push(user.password);
        }
        if (user.isActive !== undefined) {
            fields.push(`is_active = $${paramCount++}`);
            values.push(user.isActive);
        }
        if (user.userType === User_1.UserType.CUSTOMER) {
            const customer = user;
            if (customer.name) {
                fields.push(`name = $${paramCount++}`);
                values.push(customer.name);
            }
            if (customer.email) {
                fields.push(`email = $${paramCount++}`);
                values.push(customer.email);
            }
        }
        if (user.userType === User_1.UserType.RESTAURANT_OWNER) {
            const owner = user;
            if (owner.restaurantName) {
                fields.push(`restaurant_name = $${paramCount++}`);
                values.push(owner.restaurantName);
            }
            if (owner.organizationNumber) {
                fields.push(`organization_number = $${paramCount++}`);
                values.push(owner.organizationNumber);
            }
            // Handle email updates for restaurant owners
            if (owner.email) {
                fields.push(`email = $${paramCount++}`);
                values.push(owner.email);
            }
        }
        values.push(id);
        const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
        const result = await this.db.query(query, values);
        return this.mapRowToUser(result.rows[0]);
    }
    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1';
        await this.db.query(query, [id]);
    }
    async existsByMobileNumber(mobileNumber) {
        const query = 'SELECT 1 FROM users WHERE mobile_number = $1 LIMIT 1';
        const result = await this.db.query(query, [mobileNumber]);
        return result.rows.length > 0;
    }
    async existsByEmail(email) {
        const query = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
        const result = await this.db.query(query, [email]);
        return result.rows.length > 0;
    }
    async existsByOrganizationNumber(organizationNumber) {
        const query = 'SELECT 1 FROM users WHERE organization_number = $1 LIMIT 1';
        const result = await this.db.query(query, [organizationNumber]);
        return result.rows.length > 0;
    }
    mapRowToUser(row) {
        const baseUser = {
            id: row.id,
            mobileNumber: row.mobile_number,
            password: row.password,
            userType: row.user_type,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        if (row.user_type === User_1.UserType.CUSTOMER) {
            return {
                ...baseUser,
                name: row.name,
                email: row.email,
                userType: User_1.UserType.CUSTOMER,
            };
        }
        else {
            return {
                ...baseUser,
                organizationNumber: row.organization_number,
                restaurantName: row.restaurant_name,
                email: row.email, // Include email for restaurant owners
                userType: User_1.UserType.RESTAURANT_OWNER
            };
        }
    }
}
exports.UserRepository = UserRepository;
