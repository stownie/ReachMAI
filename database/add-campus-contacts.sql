-- Add Campus Contacts Table
-- This script adds a table for storing multiple contacts per campus
-- All contact fields are optional to provide maximum flexibility

-- Check if the table already exists, if so skip creation
DO $$ 
BEGIN
    -- Create campus_contacts table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campus_contacts') THEN
        CREATE TABLE campus_contacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
            name VARCHAR(255),           -- Optional: Contact person name
            phone VARCHAR(50),           -- Optional: Phone number (increased length for international)
            email VARCHAR(255),          -- Optional: Email address
            title VARCHAR(255),          -- Optional: Job title or role
            is_primary BOOLEAN DEFAULT false,  -- Optional: Mark as primary contact
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created campus_contacts table';
    ELSE
        RAISE NOTICE 'campus_contacts table already exists, skipping creation';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campus_contacts_campus_id ON campus_contacts(campus_id);
CREATE INDEX IF NOT EXISTS idx_campus_contacts_is_primary ON campus_contacts(campus_id, is_primary);

-- Ensure only one primary contact per campus
CREATE UNIQUE INDEX IF NOT EXISTS idx_campus_contacts_unique_primary 
    ON campus_contacts(campus_id) 
    WHERE is_primary = true;

-- Add trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campus_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'campus_contacts_updated_at' 
        AND event_object_table = 'campus_contacts'
    ) THEN
        CREATE TRIGGER campus_contacts_updated_at
            BEFORE UPDATE ON campus_contacts
            FOR EACH ROW
            EXECUTE FUNCTION update_campus_contacts_updated_at();
        
        RAISE NOTICE 'Created campus_contacts_updated_at trigger';
    ELSE
        RAISE NOTICE 'campus_contacts_updated_at trigger already exists';
    END IF;
END $$;

-- Add helpful comments
COMMENT ON TABLE campus_contacts IS 'Contact persons for campuses - supports multiple contacts per campus with all optional fields';
COMMENT ON COLUMN campus_contacts.name IS 'Optional contact person full name';
COMMENT ON COLUMN campus_contacts.phone IS 'Optional contact phone number';
COMMENT ON COLUMN campus_contacts.email IS 'Optional contact email address';
COMMENT ON COLUMN campus_contacts.title IS 'Optional contact job title or role';
COMMENT ON COLUMN campus_contacts.is_primary IS 'Whether this is the primary contact for the campus';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Campus contacts database setup completed successfully!';
    RAISE NOTICE '📋 You can now add multiple contacts to campuses with optional name, phone, email, and title fields.';
END $$;