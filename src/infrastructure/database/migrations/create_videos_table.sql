CREATE TYPE status_enum AS ENUM ('pending', 'rejected', 'accepted');

CREATE TABLE videos (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    secure_url VARCHAR(255) NOT NULL,
    restaurantName VARCHAR(225) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    network VARCHAR(20) NOT NULL CHECK (network IN ('MTN', 'Syriatel')),
    invoice_image VARCHAR(255) NOT NULL,
    status_video status_enum DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status_video);
