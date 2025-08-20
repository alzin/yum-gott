import { Customer } from "@/domain/entities/User";
import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { DatabaseConnection } from "../database/DataBaseConnection";

export class CustomerRepository implements ICustomerRepository {
    constructor(private db: DatabaseConnection) { }

    async create(customer: Customer): Promise<Customer> {
        const query = `
            INSERT INTO customers (
                name, email, mobile_number, password, is_active, is_email_verified, 
                verification_token, token_expires_at, profile_image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            customer.name,
            customer.email,
            customer.mobileNumber,
            customer.password,
            customer.isActive,
            customer.isEmailVerified,
            customer.verificationToken,
            customer.tokenExpiresAt,
            customer.profileImageUrl
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToCustomer(result.rows[0]);
    }

    async verifyEmail(token: string): Promise<Customer> {
        const query = `
            UPDATE customers 
            SET is_email_verified = true, verification_token = NULL, token_expires_at = NULL
            WHERE verification_token = $1 
            AND token_expires_at > CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await this.db.query(query, [token]);

        if (result.rows.length === 0) {
            throw new Error('Invalid or expired verification token');
        }

        return this.mapRowToCustomer(result.rows[0]);
    }

    async findById(id: string): Promise<Customer | null> {
        const query = 'SELECT * FROM customers WHERE id = $1';
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToCustomer(result.rows[0]);
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const query = 'SELECT * FROM customers WHERE email = $1';
        const result = await this.db.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToCustomer(result.rows[0]);
    }

    async update(id: string, customer: Partial<Customer>): Promise<Customer> {
        const fields: string[] = [];
        const values: any[] = [];
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
        if (customer.isEmailVerified !== undefined) {
            fields.push(`is_email_verified = $${paramCount++}`);
            values.push(customer.isEmailVerified);
        }
        if (customer.verificationToken !== undefined) {
            fields.push(`verification_token = $${paramCount++}`);
            values.push(customer.verificationToken);
        }
        if (customer.tokenExpiresAt !== undefined) {
            fields.push(`token_expires_at = $${paramCount++}`);
            values.push(customer.tokenExpiresAt);
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

    async updateProfileImage(id: string, profileImageUrl: string): Promise<Customer> {
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

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM customers WHERE id = $1';
        await this.db.query(query, [id]);
    }


    async existsByEmail(email: string): Promise<boolean> {
        const query = 'SELECT 1 FROM customers WHERE email = $1 LIMIT 1';
        const result = await this.db.query(query, [email]);
        return result.rows.length > 0;
    }

    async deleteUnverifiedOlderThan(date: Date): Promise<number> {
        const query = `
            DELETE FROM customers 
            WHERE is_email_verified = false 
            AND created_at < $1
            RETURNING id
        `;
        const result = await this.db.query(query, [date]);
        return result.rowCount || 0;
    }

    async getCustomerProfile(id: string): Promise<{ name: string; profileImageUrl: string | null; isActive: boolean }> {
        const query = `
            SELECT name, profile_image_url as "profileImageUrl", is_active as "isActive"
            FROM customers
            WHERE id = $1
        `;
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Customer not found');
        }
        return result.rows[0];
    }

    async updateLastSeenVideo(id: string, lastSeenVideoId: string): Promise<Customer> {
        const query = `
            UPDATE customers 
            SET last_seen_video_id = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.db.query(query, [lastSeenVideoId, id]);
        if (result.rows.length === 0) {
            throw new Error('Customer not found');
        }
        return this.mapRowToCustomer(result.rows[0]);
    }

    async updateCustomerProfile(id: string, profile: Partial<Customer>): Promise<Customer> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (profile.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(profile.name);
        }
        if (profile.email !== undefined) {
            fields.push(`email = $${paramCount++}`);
            values.push(profile.email);
        }
        if (profile.mobileNumber !== undefined) {
            fields.push(`mobile_number = $${paramCount++}`);
            values.push(profile.mobileNumber);
        }
        if (profile.about !== undefined) {
            fields.push(`about = $${paramCount++}`);
            values.push(profile.about);
        }
        if (profile.gender !== undefined) {
            fields.push(`gender = $${paramCount++}`);
            values.push(profile.gender);
        }
        if (profile.profileImageUrl !== undefined) {
            fields.push(`profile_image_url = $${paramCount++}`);
            values.push(profile.profileImageUrl);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id);
        const query = `
            UPDATE customers
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        const result = await this.db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Customer not found');
        }
        return this.mapRowToCustomer(result.rows[0]);
    }

    private mapRowToCustomer(row: any): Customer {
        return {
            id: row.id,
            name: row.name,
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
            lastSeenVideoId: row.last_seen_video_id
        };
    }
}