-- Migration to fix the schema and allow email for restaurant owners
-- This replaces the original 001_create_users_table.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safe enum creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('customer', 'restaurant_owner');
    END IF;
END$$;

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Customer specific fields
    name VARCHAR(255),
    email VARCHAR(255),
    
    -- Restaurant owner specific fields
    restaurant_name VARCHAR(255),
    organization_number VARCHAR(50),
    
    -- Updated constraints to allow email for both user types
    CONSTRAINT customer_fields_check CHECK (
        (user_type = 'customer' AND name IS NOT NULL AND restaurant_name IS NULL AND organization_number IS NULL) OR
        (user_type = 'restaurant_owner' AND restaurant_name IS NOT NULL AND organization_number IS NOT NULL AND name IS NULL)
    ),
    
    -- Email can be present for both customer and restaurant_owner
    CONSTRAINT unique_email CHECK (email IS NULL OR email != ''),
    CONSTRAINT unique_organization_number CHECK (organization_number IS NULL OR organization_number != '')
);

-- Create indexes
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_users_organization_number ON users(organization_number) WHERE organization_number IS NOT NULL;
CREATE INDEX idx_users_mobile_number ON users(mobile_number);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();