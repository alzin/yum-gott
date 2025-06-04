import { Customer } from "@/domain/entities/User";
import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { DatabaseConnection } from "../database/DataBaseConnection";

export class CustomerRepository implements ICustomerRepository {
    constructor(private db: DatabaseConnection) {}

    async create(customer: Customer): Promise<Customer> {
        const query = `
            INSERT INTO customers (
                name, email, mobile_number, password, is_active
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [
            customer.name,
            customer.email,
            customer.mobileNumber,
            customer.password,
            customer.isActive
        ];

        const result = await this.db.query(query, values);
        return this.mapRowToCustomer(result.rows[0]);
    }

    async findByMobileNumber(mobileNumber: string): Promise<Customer | null> {
        const query = 'SELECT * FROM customers WHERE mobile_number = $1';
        const result = await this.db.query(query, [mobileNumber]);
        if (result.rows.length === 0) {
            return null;
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

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM customers WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async existsByMobileNumber(mobileNumber: string): Promise<boolean> {
        const query = 'SELECT 1 FROM customers WHERE mobile_number = $1 LIMIT 1';
        const result = await this.db.query(query, [mobileNumber]);
        return result.rows.length > 0;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const query = 'SELECT 1 FROM customers WHERE email = $1 LIMIT 1';
        const result = await this.db.query(query, [email]);
        return result.rows.length > 0;
    }

    private mapRowToCustomer(row: any): Customer {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            mobileNumber: row.mobile_number,
            password: row.password,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
