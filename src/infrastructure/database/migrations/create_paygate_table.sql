-- Create paygates table with a single column gate_name
-- Note: PRIMARY KEY enforces uniqueness without adding extra columns
CREATE TABLE IF NOT EXISTS paygates (
    gate_name VARCHAR(128) PRIMARY KEY
);


