"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataBaseConnection_1 = require("./DataBaseConnection");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Debug: Print environment variables
console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('Current directory:', process.cwd());
console.log('Looking for .env in:', path_1.default.resolve(process.cwd(), '.env'));
async function runMigration() {
    const db = DataBaseConnection_1.DatabaseConnection.getInstance();
    try {
        console.log('🔧 Running migration...');
        const migrationPath = path_1.default.join(__dirname, 'migrations/000_full_users_setup.sql');
        if (!fs_1.default.existsSync(migrationPath)) {
            console.error(`❌ Migration file not found at: ${migrationPath}`);
            process.exit(1);
        }
        const migrationSQL = fs_1.default.readFileSync(migrationPath, 'utf8');
        await db.query(migrationSQL);
        console.log('✅ Migration completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        await db.close();
    }
}
runMigration();
