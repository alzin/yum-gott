"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
class CustomerRepository {
    constructor(db) {
        this.db = db;
    }
    async create(customer) {
        const query = `
            INSERT INTO customers (
                name, email, mobile_number, password, is_active, profile_image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            customer.name,
            customer.email,
            customer.mobileNumber,
            customer.password,
            customer.isActive,
            customer.profileImageUrl
        ];
        const result = await this.db.query(query, values);
        return this.mapRowToCustomer(result.rows[0]);
    }
    async createPending(pendingUser) {
        const query = `
            INSERT INTO pending_users (
                name, email, mobile_number, password, user_type, verification_token, token_expires_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
            pendingUser.name,
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
            AND user_type = 'customer'
            AND token_expires_at > CURRENT_TIMESTAMP
        `;
        const result = await this.db.query(findQuery, [token]);
        if (result.rows.length === 0) {
            throw new Error('Invalid or expired verification token');
        }
        const pendingUser = result.rows[0];
        const customer = {
            name: pendingUser.name,
            email: pendingUser.email,
            mobileNumber: pendingUser.mobile_number,
            password: pendingUser.password,
            isActive: true,
            profileImageUrl: null
        };
        const createdCustomer = await this.create(customer);
        await this.db.query('DELETE FROM pending_users WHERE verification_token = $1', [token]);
        return createdCustomer;
    }
    async findByMobileNumber(mobileNumber) {
        const query = 'SELECT * FROM customers WHERE mobile_number = $1';
        const result = await this.db.query(query, [mobileNumber]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToCustomer(result.rows[0]);
    }
    async findById(id) {
        const query = 'SELECT * FROM customers WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToCustomer(result.rows[0]);
    }
    async findByEmail(email) {
        const query = 'SELECT * FROM customers WHERE email = $1';
        const result = await this.db.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToCustomer(result.rows[0]);
    }
    async update(id, customer) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (customer.name) {
            fields.push(`name = $${paramCount++}`);
            values.push(customer.name);
        }
        if (customer.email) {
            fields.push(`email = $${paramCount++}`);
            values.push(customer.email);
        }
        if (customer.mobileNumber) {
            fields.push(`mobile_number = $${paramCount++}`);
            values.push(customer.mobileNumber);
        }
        if (customer.password) {
            fields.push(`password = $${paramCount++}`);
            values.push(customer.password);
        }
        if (customer.isActive !== undefined) {
            fields.push(`is_active = $${paramCount++}`);
            values.push(customer.isActive);
        }
        if (customer.profileImageUrl !== undefined) {
            fields.push(`profile_image_url = $${paramCount++}`);
            values.push(customer.profileImageUrl);
        }
        values.push(id);
        const query = `
            UPDATE customers 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        const result = await this.db.query(query, values);
        return this.mapRowToCustomer(result.rows[0]);
    }
    async updateProfileImage(id, profileImageUrl) {
        const query = `
            UPDATE customers 
            SET profile_image_url = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.db.query(query, [profileImageUrl, id]);
        if (result.rows.length === 0) {
            throw new Error('Customer not found');
        }
        return this.mapRowToCustomer(result.rows[0]);
    }
    async delete(id) {
        const query = 'DELETE FROM customers WHERE id = $1';
        await this.db.query(query, [id]);
    }
    async existsByMobileNumber(mobileNumber) {
        const query = 'SELECT 1 FROM customers WHERE mobile_number = $1 LIMIT 1';
        const result = await this.db.query(query, [mobileNumber]);
        return result.rows.length > 0;
    }
    async existsByEmail(email) {
        const query = 'SELECT 1 FROM customers WHERE email = $1 LIMIT 1';
        const result = await this.db.query(query, [email]);
        return result.rows.length > 0;
    }
    mapRowToCustomer(row) {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            mobileNumber: row.mobile_number,
            password: row.password,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            profileImageUrl: row.profile_image_url
        };
    }
}
exports.CustomerRepository = CustomerRepository;
