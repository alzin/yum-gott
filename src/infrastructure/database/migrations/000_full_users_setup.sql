-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS restaurant_owners CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_image_url VARCHAR(255)
);

-- Create restaurant_owners table
CREATE TABLE restaurant_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_name VARCHAR(255) NOT NULL,
    organization_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_image_url VARCHAR(255)
);

-- Create indexes for customers
CREATE UNIQUE INDEX idx_customers_email ON customers(email);
CREATE UNIQUE INDEX idx_customers_mobile_number ON customers(mobile_number);
CREATE INDEX idx_customers_verification_token ON customers(verification_token);

-- Create indexes for restaurant_owners
CREATE UNIQUE INDEX idx_restaurant_owners_email ON restaurant_owners(email);
CREATE UNIQUE INDEX idx_restaurant_owners_organization_number ON restaurant_owners(organization_number);
CREATE UNIQUE INDEX idx_restaurant_owners_mobile_number ON restaurant_owners(mobile_number);
CREATE INDEX idx_restaurant_owners_verification_token ON restaurant_owners(verification_token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for customers table
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for restaurant_owners table
CREATE TRIGGER update_restaurant_owners_updated_at 
    BEFORE UPDATE ON restaurant_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();