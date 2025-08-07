CREATE TABLE IF NOT EXISTS invalidated_tokens (
    token VARCHAR(512) PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invalidated_tokens_expires_at') THEN
        CREATE INDEX idx_invalidated_tokens_expires_at ON invalidated_tokens (expires_at);
    END IF;
END $$;