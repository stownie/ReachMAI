-- Add Campus Contacts Table
-- This script adds a table for storing multiple contacts per campus

CREATE TABLE campus_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for campus contacts
CREATE INDEX idx_campus_contacts_campus_id ON campus_contacts(campus_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campus_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campus_contacts_updated_at
    BEFORE UPDATE ON campus_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_campus_contacts_updated_at();