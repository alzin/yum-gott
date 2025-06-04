-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist, in the correct order to avoid dependency issues
DROP TABLE IF EXISTS restaurant_owners CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS base_users CASCADE;
DROP TABLE IF EXISTS pending_users CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

-- Create user_type enum
CREATE TYPE user_type AS ENUM ('customer', 'restaurant_owner');

-- Create pending_users table for unverified users
CREATE TABLE pending_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL,
    name VARCHAR(255),
    restaurant_name VARCHAR(255),
    organization_number VARCHAR(50),
    verification_token VARCHAR(255) NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mobile_number),
    UNIQUE(email)
);

-- Create base_users table with common fields
CREATE TABLE base_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table that inherits from base_users
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) INHERITS (base_users);

-- Create restaurant_owners table that inherits from base_users
CREATE TABLE restaurant_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    organization_number VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) INHERITS (base_users);

-- Create indexes for customers
CREATE UNIQUE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_customers_mobile_number ON customers(mobile_number);

-- Create indexes for restaurant_owners
CREATE UNIQUE INDEX idx_restaurant_owners_email ON restaurant_owners(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_restaurant_owners_organization_number ON restaurant_owners(organization_number);
CREATE UNIQUE INDEX idx_restaurant_owners_mobile_number ON restaurant_owners(mobile_number);

-- Create index for pending_users
CREATE UNIQUE INDEX idx_pending_users_email ON pending_users(email);
CREATE UNIQUE INDEX idx_pending_users_mobile_number ON pending_users(mobile_number);
CREATE INDEX idx_pending_users_verification_token ON pending_users(verification_token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for base_users table
CREATE TRIGGER update_base_users_updated_at 
    BEFORE UPDATE ON base_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for customers table
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for restaurant_owners table
CREATE TRIGGER update_restaurant_owners_updated_at 
    BEFORE UPDATE ON restaurant_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();