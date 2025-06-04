-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist, in the correct order to avoid dependency issues
DROP TABLE IF EXISTS restaurant_owners CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS base_users CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

-- Create user_type enum
CREATE TYPE user_type AS ENUM ('customer', 'restaurant_owner');

-- Create base_users table with common fields
CREATE TABLE base_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table that contains all users with their type
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL,
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

-- Create indexes for users table
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_users_mobile_number ON users(mobile_number);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Create indexes for customers
CREATE UNIQUE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_customers_mobile_number ON customers(mobile_number);

-- Create indexes for restaurant_owners
CREATE UNIQUE INDEX idx_restaurant_owners_email ON restaurant_owners(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_restaurant_owners_organization_number ON restaurant_owners(organization_number);
CREATE UNIQUE INDEX idx_restaurant_owners_mobile_number ON restaurant_owners(mobile_number);

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

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for customers table
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for restaurant_owners table
CREATE TRIGGER update_restaurant_owners_updated_at 
    BEFORE UPDATE ON restaurant_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync users table with base_users
CREATE OR REPLACE FUNCTION sync_users_with_base_users()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert into users table
        INSERT INTO users (id, mobile_number, email, password, user_type, is_active, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.mobile_number,
            NEW.email,
            NEW.password,
            CASE 
                WHEN TG_TABLE_NAME = 'customers' THEN 'customer'::user_type
                WHEN TG_TABLE_NAME = 'restaurant_owners' THEN 'restaurant_owner'::user_type
            END,
            NEW.is_active,
            NEW.created_at,
            NEW.updated_at
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update users table
        UPDATE users
        SET 
            mobile_number = NEW.mobile_number,
            email = NEW.email,
            password = NEW.password,
            is_active = NEW.is_active,
            updated_at = NEW.updated_at
        WHERE id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Delete from users table
        DELETE FROM users WHERE id = OLD.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to sync users table with base_users
CREATE TRIGGER sync_customers_to_users
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION sync_users_with_base_users();

CREATE TRIGGER sync_restaurant_owners_to_users
    AFTER INSERT OR UPDATE OR DELETE ON restaurant_owners
    FOR EACH ROW EXECUTE FUNCTION sync_users_with_base_users();