CREATE TABLE products (
    id UUID PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2),
    add_size VARCHAR(20),
    image_url TEXT,
    restaurant_owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_owner_id) REFERENCES restaurant_owners(id)
);
