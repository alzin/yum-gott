import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupAndMigrateDatabase() {
  const db = DatabaseConnection.getInstance();

  try {
    console.log('🔧 Setting up and migrating database...');

    const migrationPaths = [ 
      path.join(__dirname, 'migrations', 'full_users_setup.sql'),
      path.join(__dirname, 'migrations', 'create_products_table.sql')
    ];

    for (const filePath of migrationPaths) {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Migration file not found: ${filePath}`);
        process.exit(1);
      }
    }

    for (const filePath of migrationPaths) {
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`📂 Running migration: ${path.basename(filePath)}`);
      await db.query(sql);
    }

    console.log('✅ All migrations executed successfully');

    const result = await db.query('SELECT current_database(), current_user, version()');
    console.log('📊 Database info:', result.rows[0]);



  } catch (error) {
    console.error('❌ Database setup/migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

setupAndMigrateDatabase();
