import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  const db = DatabaseConnection.getInstance();
  
  try {
    console.log('🔧 Setting up database...');
    
    // Fixed the migration path
    const migrationPath = path.join(__dirname, 'migrations/001_create_users_table.sql');
    
    // Check if migration file exists
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found at: ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.query(migrationSQL);
    
    console.log('✅ Database setup completed successfully');
    
    // Test the connection
    const result = await db.query('SELECT current_database(), current_user, version()');
    console.log('📊 Database info:', result.rows[0]);
    
    // Test if users table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('👥 Users table exists:', tableCheck.rows[0].exists);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

setupDatabase();