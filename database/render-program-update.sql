-- Program Management Database Update for Render
-- Run this script in the Render PostgreSQL terminal

-- Create program_categories table
CREATE TABLE IF NOT EXISTS program_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default program categories
INSERT INTO program_categories (name, description) VALUES
    ('Recital', 'Performance recitals and showcases'),
    ('Ensemble', 'Group ensemble performances and rehearsals'),
    ('Class', 'Regular instructional classes'),
    ('Private Lesson', 'One-on-one private instruction'),
    ('Parent Meeting', 'Parent meetings and orientations')
ON CONFLICT (name) DO NOTHING;

-- Add category_id column to programs table if it doesn't exist
ALTER TABLE programs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES program_categories(id);

-- Update existing programs to use default 'Class' category
UPDATE programs 
SET category_id = (SELECT id FROM program_categories WHERE name = 'Class' LIMIT 1)
WHERE category_id IS NULL;

-- Remove duration_weeks column from programs table if it exists
ALTER TABLE programs DROP COLUMN IF EXISTS duration_weeks;

-- Remove the old category string column if it exists
ALTER TABLE programs DROP COLUMN IF EXISTS category;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_category_id ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_programs_organization_id ON programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_program_categories_name ON program_categories(name);

-- Add trigger function for program_categories updated_at
CREATE OR REPLACE FUNCTION update_program_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for program_categories
DROP TRIGGER IF EXISTS program_categories_updated_at ON program_categories;
CREATE TRIGGER program_categories_updated_at
    BEFORE UPDATE ON program_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_program_categories_updated_at();

-- Success message
SELECT 'Program categories and programs table updated successfully!' as status;