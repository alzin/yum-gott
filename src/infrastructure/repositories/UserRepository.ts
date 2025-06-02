import { User, Customer, restaurantOwner, UserType } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { DatabaseConnection } from "../database/DataBaseConnection";

export class UserRepository implements IUserRepository {
  constructor(private db: DatabaseConnection) { }

  async create<T extends User>(user: T): Promise<T> {
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
      user.userType === UserType.CUSTOMER ? (user as Customer).name : null,
      user.userType === UserType.CUSTOMER ? (user as Customer).email : null,
      user.userType === UserType.RESTAURANT_OWNER ? (user as restaurantOwner).restaurantName : null,
      user.userType === UserType.RESTAURANT_OWNER ? (user as restaurantOwner).organizationNumber : null
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToUser(result.rows[0]) as T;
  }

  async findByMobileNumber(mobileNumber: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE mobile_number = $1';
    const result = await this.db.query(query, [mobileNumber]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
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

    if (user.userType === UserType.CUSTOMER) {
      const customer = user as Partial<Customer>;
      if (customer.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(customer.name);
      }
      if (customer.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(customer.email);
      }
    }

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

  private mapRowToUser(row: any): User {
    const baseUser = {
      id: row.id,
      mobileNumber: row.mobile_number,
      password: row.password,
      userType: row.user_type,
      isActive: row.is_active,
      createdAt: row.created_at,    // Fixed typo
      updatedAt: row.updated_at     // Fixed typo: was 'update_ar'
    };

    if (row.user_type === UserType.CUSTOMER) {
      return {
        ...baseUser,
        name: row.name,
        email: row.email,
        userType: UserType.CUSTOMER,
      } as Customer;
    } else {
      return {
        ...baseUser,
        organizationNumber: row.organization_number,
        restaurantName: row.restaurant_name,
        userType: UserType.RESTAURANT_OWNER
      } as restaurantOwner;
    }
  }
}