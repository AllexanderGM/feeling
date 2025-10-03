-- Migration V3: Add church attributes support
-- Add church_id foreign key and custom_church field
-- Migrate existing church string data to custom_church

-- Add new columns for church support
ALTER TABLE users ADD COLUMN church_id BIGINT;
ALTER TABLE users ADD COLUMN custom_church VARCHAR(255);

-- Add foreign key constraint for church_id
ALTER TABLE users ADD CONSTRAINT fk_user_church 
    FOREIGN KEY (church_id) REFERENCES user_attributes(id);

-- Migrate existing church string data to custom_church
UPDATE users 
SET custom_church = church 
WHERE church IS NOT NULL AND church != '';

-- Drop the old church column
ALTER TABLE users DROP COLUMN church;

-- Add index for better performance
CREATE INDEX idx_users_church_id ON users(church_id);