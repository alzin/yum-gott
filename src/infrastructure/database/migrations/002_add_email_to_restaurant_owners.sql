ALTER TABLE users DROP CONSTRAINT IF EXISTS customer_fields_check;

-- Add the new constraint that allows email for restaurant owners
ALTER TABLE users ADD CONSTRAINT customer_fields_check CHECK (
    (user_type = 'customer' AND name IS NOT NULL AND email IS NOT NULL AND restaurant_name IS NULL AND organization_number IS NULL) OR
    (user_type = 'restaurant_owner' AND restaurant_name IS NOT NULL AND organization_number IS NOT NULL AND email IS NOT NULL AND name IS NULL)
);

-- Make email NOT NULL for restaurant owners (if needed)
-- First, set a default email for existing restaurant owners without email
UPDATE users 
SET email = CONCAT('temp_', id, '@restaurant.com') 
WHERE user_type = 'restaurant_owner' AND email IS NULL;

-- Create a unique constraint for email across all user types
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;