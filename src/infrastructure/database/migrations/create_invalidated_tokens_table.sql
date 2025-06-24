CREATE TABLE invalidated_tokens (
    token VARCHAR(512) PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invalidated_tokens_expires_at ON invalidated_tokens (expires_at);