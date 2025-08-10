import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    const connectionString = process.env.DATABASE_URL;

    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Neon.tech
      }
    });

    // Test the connection
    this.pool.on('connect', () => {
      console.log('Successfully connected to the database');
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      console.error('Error getting database client:', error);
      throw error;
    }
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      console.log('Executing query:', text);
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }

  public getPool(): Pool {
    return this.pool;
  }

  // Safety method to check if a table exists
  public async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  // Safety method to get table row count
  public async getTableRowCount(tableName: string): Promise<number> {
    try {
      const result = await this.query(`SELECT COUNT(*) FROM ${tableName}`);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error getting row count for table ${tableName}:`, error);
      return 0;
    }
  }

  // Utility method to generate UUIDs consistently across the app
  public generateUUID(): string {
    return uuidv4();
  }
}
