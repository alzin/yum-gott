import { Pool, PoolClient } from 'pg';

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

  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}
