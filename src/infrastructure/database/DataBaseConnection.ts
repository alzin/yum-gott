import { Pool, PoolClient } from 'pg';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
