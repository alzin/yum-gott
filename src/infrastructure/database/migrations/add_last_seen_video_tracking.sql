-- Add last_seen_video_id field to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_seen_video_id UUID DEFAULT NULL;

-- Add last_seen_video_id field to restaurant_owners table
ALTER TABLE restaurant_owners 
ADD COLUMN IF NOT EXISTS last_seen_video_id UUID DEFAULT NULL;

-- Create indexes for fast queries on last_seen_video_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_customers_last_seen_video') THEN
        CREATE INDEX idx_customers_last_seen_video ON customers(last_seen_video_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_restaurant_owners_last_seen_video') THEN
        CREATE INDEX idx_restaurant_owners_last_seen_video ON restaurant_owners(last_seen_video_id);
    END IF;
END $$;

-- Add foreign key constraints to ensure data integrity
DO $$ 
BEGIN
    -- Add foreign key for customers table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customers_last_seen_video'
    ) THEN
        ALTER TABLE customers 
        ADD CONSTRAINT fk_customers_last_seen_video 
        FOREIGN KEY (last_seen_video_id) REFERENCES videos(id) ON DELETE SET NULL;
    END IF;
    
    -- Add foreign key for restaurant_owners table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_restaurant_owners_last_seen_video'
    ) THEN
        ALTER TABLE restaurant_owners 
        ADD CONSTRAINT fk_restaurant_owners_last_seen_video 
        FOREIGN KEY (last_seen_video_id) REFERENCES videos(id) ON DELETE SET NULL;
    END IF;
END $$;