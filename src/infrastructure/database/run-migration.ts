import { DatabaseConnection } from './DataBaseConnection';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Print environment variables
console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('Current directory:', process.cwd());
console.log('Looking for .env in:', path.resolve(process.cwd(), '.env'));

async function runMigration() {
    const db = DatabaseConnection.getInstance();

    try {
        console.log('🔧 Running migration...');

        const migrationPath = path.join(__dirname, 'migrations/000_full_users_setup.sql');

        if (!fs.existsSync(migrationPath)) {
            console.error(`❌ Migration file not found at: ${migrationPath}`);
            process.exit(1);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        await db.query(migrationSQL);

        console.log('✅ Migration completed successfully');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runMigration(); 