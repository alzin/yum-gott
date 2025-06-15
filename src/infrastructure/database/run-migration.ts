import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupAndMigrateDatabase() {
  const db = DatabaseConnection.getInstance();

  try {
    console.log('🔧 Setting up and migrating database...');

    const migrationPath = path.join(__dirname, 'migrations/000_full_users_setup.sql');

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found at: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');


    await db.query(migrationSQL);
    console.log('✅ Migration completed successfully');

 
    const result = await db.query('SELECT current_database(), current_user, version()');
    console.log('📊 Database info:', result.rows[0]);

 const tableCheckCustomers = await db.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'customers'
  );
`);

const tableCheckRestaurantOwners = await db.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'restaurant_owners'
  );
`);

console.log('👥 Customers table exists:', tableCheckCustomers.rows[0].exists);
console.log('🏢 Restaurant owners table exists:', tableCheckRestaurantOwners.rows[0].exists)

  } catch (error) {
    console.error('❌ Database setup/migration failed:', error);
    process.exit(1);
  } finally {

    await db.close();
  }
}

setupAndMigrateDatabase();
