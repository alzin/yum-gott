CREATE TABLE opening_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_owner_id UUID NOT NULL,
    day VARCHAR(10) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    Working_hours JSONB NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_restaurant_owner
        FOREIGN KEY (restaurant_owner_id)
        REFERENCES restaurant_owners(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_opening_hours_restaurant_owner_id ON opening_hours (restaurant_owner_id);