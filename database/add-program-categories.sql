-- Add Program Categories and Update Programs Table
-- This script creates program_categories table and updates programs table structure

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

-- Remove duration_weeks column from programs table if it exists
ALTER TABLE programs DROP COLUMN IF EXISTS duration_weeks;

-- Add category_id foreign key to programs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programs' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE programs ADD COLUMN category_id UUID REFERENCES program_categories(id);
    END IF;
END $$;

-- Update existing programs to use category_id instead of category string
-- First, try to match existing category strings to new category IDs
UPDATE programs 
SET category_id = pc.id 
FROM program_categories pc 
WHERE programs.category IS NOT NULL 
    AND LOWER(programs.category) = LOWER(pc.name)
    AND programs.category_id IS NULL;

-- Set default category for programs without a matching category
UPDATE programs 
SET category_id = (SELECT id FROM program_categories WHERE name = 'Class' LIMIT 1)
WHERE category_id IS NULL;

-- Remove the old category string column
ALTER TABLE programs DROP COLUMN IF EXISTS category;

-- Add trigger function for program_categories updated_at
CREATE OR REPLACE FUNCTION update_program_categories_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger for program_categories
DROP TRIGGER IF EXISTS program_categories_updated_at ON program_categories;
CREATE TRIGGER program_categories_updated_at
    BEFORE UPDATE ON program_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_program_categories_updated_at();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_category_id ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_programs_organization_id ON programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_program_categories_name ON program_categories(name);

-- Add helpful comments
COMMENT ON TABLE program_categories IS 'Categories for organizing different types of programs';
COMMENT ON COLUMN program_categories.name IS 'Category name (Recital, Ensemble, Class, Private Lesson, Parent Meeting)';
COMMENT ON COLUMN programs.category_id IS 'Reference to program category';

-- Success message
SELECT 'Program categories table created and programs table updated successfully!' as status;
SELECT 'Available categories: Recital, Ensemble, Class, Private Lesson, Parent Meeting' as info;