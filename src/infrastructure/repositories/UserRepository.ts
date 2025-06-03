import { User, Customer, restaurantOwner, UserType } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { DatabaseConnection } from "../database/DataBaseConnection";

export class UserRepository implements IUserRepository {
  constructor(private db: DatabaseConnection) { }

  async create<T extends User>(user: T): Promise<T> {
    const query = `
    INSERT INTO users (
      email, mobile_number, password, user_type, is_active,
      name, restaurant_name, organization_number
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

    const values = [
      user.email,                   // $1 - email (موجود في كلا النوعين)
      user.mobileNumber,            // $2 - mobile_number
      user.password,                // $3 - password
      user.userType,                // $4 - user_type
      user.isActive,                // $5 - is_active
      user.userType === UserType.CUSTOMER ? (user as Customer).name : null,  // $6 - name
      user.userType === UserType.RESTAURANT_OWNER ? (user as restaurantOwner).restaurantName : null,  // $7 - restaurant_name
      user.userType === UserType.RESTAURANT_OWNER ? (user as restaurantOwner).organizationNumber : null // $8 - organization_number
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToUser(result.rows[0]) as T;
  }

  async update<T extends User>(id: string, user: Partial<T>): Promise<T> {
    const fields: string[] = [];
    const values: any[] = [];
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

    if (user.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(user.email);
    }

    // Customer-specific fields
    if (user.userType === UserType.CUSTOMER) {
      const customer = user as Partial<Customer>;
      if (customer.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(customer.name);
      }
    }

    // Restaurant owner-specific fields
    if (user.userType === UserType.RESTAURANT_OWNER) {
      const owner = user as Partial<restaurantOwner>;
      if (owner.restaurantName) {
        fields.push(`restaurant_name = $${paramCount++}`);
        values.push(owner.restaurantName);
      }
      if (owner.organizationNumber) {
        fields.push(`organization_number = $${paramCount++}`);
        values.push(owner.organizationNumber);
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

    const result = await this.db.query(query, values);
    return this.mapRowToUser(result.rows[0]) as T;
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM users WHERE id = $1';
    await this.db.query(query, [id]);
  }

  async existsByMobileNumber(mobileNumber: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE mobile_number = $1 LIMIT 1';
    const result = await this.db.query(query, [mobileNumber]);
    return result.rows.length > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
    const result = await this.db.query(query, [email]);
    return result.rows.length > 0;
  }

  async existsByOrganizationNumber(organizationNumber: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE organization_number = $1 LIMIT 1';
    const result = await this.db.query(query, [organizationNumber]);
    return result.rows.length > 0;
  }

  async findByMobileNumber(mobileNumber: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE mobile_number = $1';
    const result = await this.db.query(query, [mobileNumber]);
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  private mapRowToUser(row: any): User {
    const baseUser = {
      id: row.id,
      email: row.email,          // إضافة email هنا
      mobileNumber: row.mobile_number,
      password: row.password,
      userType: row.user_type,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    if (row.user_type === UserType.CUSTOMER) {
      return {
        ...baseUser,
        name: row.name,
        userType: UserType.CUSTOMER,
      } as Customer;
    } else {
      return {
        ...baseUser,
        restaurantName: row.restaurant_name,
        organizationNumber: row.organization_number,
        userType: UserType.RESTAURANT_OWNER
      } as restaurantOwner;
    }
  }
}