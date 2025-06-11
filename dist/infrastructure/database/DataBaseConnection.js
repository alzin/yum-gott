"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const pg_1 = require("pg");
class DatabaseConnection {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        console.log('Attempting to connect to database...');
        console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
        this.pool = new pg_1.Pool({
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
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async getClient() {
        try {
            const client = await this.pool.connect();
            return client;
        }
        catch (error) {
            console.error('Error getting database client:', error);
            throw error;
        }
    }
    async query(text, params) {
        const client = await this.getClient();
        try {
            console.log('Executing query:', text);
            const result = await client.query(text, params);
            return result;
        }
        catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        try {
            await this.pool.end();
            console.log('Database connection closed');
        }
        catch (error) {
            console.error('Error closing database connection:', error);
            throw error;
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
