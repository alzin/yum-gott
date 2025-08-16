import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFilePath = `.env.${nodeEnv}`;
dotenv.config({ path: envFilePath });

class MigrationRunner {
  private db: DatabaseConnection;

  private readonly migrationPaths = [
    'full_users_setup.sql',
    'create_products_table.sql',
    'create_product_options_table.sql',
    'create_invalidated_tokens_table.sql',
    'create_refresh_tokens_table.sql',
    'create_categories_table.sql',
    'create_opening_hours_table.sql',
    'create_videos_table.sql',
    'add_last_seen_video_tracking.sql',
    'add_likes_column_to_videos.sql',
    'create_comments_table.sql',
    'create_likes_table.sql',
    'create_paygate_table.sql'
  ].map(file => path.join(__dirname, 'migrations', file));

  private readonly dangerousKeywords = [
    'DROP TABLE', 'DROP DATABASE', 'TRUNCATE', 'DELETE FROM', 'DROP SCHEMA', 'DROP CASCADE'
  ];

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async run(): Promise<void> {
    try {
      console.log('🔧 Setting up and migrating database...');

      this.validateFiles();

      for (const filePath of this.migrationPaths) {
        await this.processMigration(filePath);
      }

      console.log('✅ All migrations executed successfully');
      await this.showDatabaseInfo();

    } catch (error) {
      console.error('❌ Database migration failed:', error);
      process.exit(1);
    } finally {
      await this.db.close();
    }
  }

  private validateFiles(): void {
    const missing = this.migrationPaths.filter(path => !fs.existsSync(path));
    if (missing.length > 0) {
      console.error(`❌ Missing migration files: ${missing.map(p => path.basename(p)).join(', ')}`);
      process.exit(1);
    }
  }

  private async processMigration(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const migrationId = fileName.replace('.sql', '');
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Skip if tables already exist
    if (await this.shouldSkip(migrationId, sql)) {
      console.log(`⏭️  Skipping: ${fileName} (tables already exist)`);
      return;
    }

    // Validate safety
    if (!this.isSafe(sql)) {
      console.error(`❌ Dangerous operations detected in: ${fileName}`);
      process.exit(1);
    }

    // Warn about existing data
    await this.checkExistingData(sql);

    // Execute migration
    await this.executeMigration(migrationId, fileName, sql);
  }

  private async shouldSkip(migrationId: string, sql: string): Promise<boolean> {
    // Special case for full_users_setup
    if (migrationId === 'full_users_setup') {
      const [customersExists, ownersExists] = await Promise.all([
        this.db.tableExists('customers'),
        this.db.tableExists('restaurant_owners')
      ]);
      if (customersExists && ownersExists) {
        console.log(`⏭️  Skipping: ${migrationId} (tables exist)`);
        return true;
      }
    }

    // Check for any table creation
    const tableMatches = [...sql.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi)];
    for (const [, tableName] of tableMatches) {
      if (await this.db.tableExists(tableName)) {
        console.log(`⏭️  Skipping: ${migrationId} (table '${tableName}' exists)`);
        return true;
      }
    }

    return false;
  }

  private isSafe(sql: string): boolean {
    const cleanSQL = sql.split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .toUpperCase();

    return !this.dangerousKeywords.some(keyword => cleanSQL.includes(keyword));
  }

  private async checkExistingData(sql: string): Promise<void> {
    const tableMatches = [...sql.matchAll(/CREATE TABLE (\w+)/gi)];

    for (const [, tableName] of tableMatches) {
      if (await this.db.tableExists(tableName)) {
        const rowCount = await this.db.getTableRowCount(tableName);
        if (rowCount > 0) {
          console.warn(`⚠️  Table '${tableName}' exists with ${rowCount} rows`);
        }
      }
    }
  }

  private async executeMigration(id: string, name: string, sql: string): Promise<void> {
    console.log(`📂 Running: ${name}`);

    try {
      await this.db.transaction(async (client) => {
        await client.query(sql);
      });

      console.log(`✅ Completed: ${name}`);
    } catch (error) {
      console.error(`❌ Failed: ${name}`, error);
      throw error;
    }
  }

  private async showDatabaseInfo(): Promise<void> {
    const result = await this.db.query('SELECT current_database(), current_user, version()');
    console.log('📊 Database:', result.rows[0]);
  }
}

// Run migrations
new MigrationRunner().run();