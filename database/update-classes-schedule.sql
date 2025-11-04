-- Update Classes Table for Enhanced Schedule Management
-- This script adds campus_id, room_id, and allow_public_enrollment to classes table

-- Add new columns to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS campus_id UUID REFERENCES campuses(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES campus_rooms(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS allow_public_enrollment BOOLEAN DEFAULT true;

-- Create indexes for performance and conflict checking
CREATE INDEX IF NOT EXISTS idx_classes_campus_id ON classes(campus_id);
CREATE INDEX IF NOT EXISTS idx_classes_room_id ON classes(room_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_schedule ON classes(teacher_id, day_of_week, start_time, end_time, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_classes_room_schedule ON classes(room_id, day_of_week, start_time, end_time, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_classes_public_enrollment ON classes(allow_public_enrollment);

-- Add helpful comments
COMMENT ON COLUMN classes.campus_id IS 'Campus where the class is held';
COMMENT ON COLUMN classes.room_id IS 'Specific room within the campus (optional)';
COMMENT ON COLUMN classes.allow_public_enrollment IS 'Whether the class is available for public enrollment';

-- Function to check for teacher schedule conflicts
CREATE OR REPLACE FUNCTION check_teacher_schedule_conflict(
    p_teacher_id UUID,
    p_class_id UUID,
    p_day_of_week INTEGER,
    p_start_time TIME,
    p_end_time TIME,
    p_start_date DATE,
    p_end_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM classes
    WHERE teacher_id = p_teacher_id
        AND id != COALESCE(p_class_id, gen_random_uuid()) -- Exclude current class for updates
        AND day_of_week = p_day_of_week
        AND is_active = true
        AND (
            -- Date ranges overlap
            (start_date <= p_end_date AND end_date >= p_start_date)
        )
        AND (
            -- Time ranges overlap
            (start_time < p_end_time AND end_time > p_start_time)
        );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check for room schedule conflicts
CREATE OR REPLACE FUNCTION check_room_schedule_conflict(
    p_room_id UUID,
    p_class_id UUID,
    p_day_of_week INTEGER,
    p_start_time TIME,
    p_end_time TIME,
    p_start_date DATE,
    p_end_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Skip check if no room is specified
    IF p_room_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT COUNT(*) INTO conflict_count
    FROM classes
    WHERE room_id = p_room_id
        AND id != COALESCE(p_class_id, gen_random_uuid()) -- Exclude current class for updates
        AND day_of_week = p_day_of_week
        AND is_active = true
        AND (
            -- Date ranges overlap
            (start_date <= p_end_date AND end_date >= p_start_date)
        )
        AND (
            -- Time ranges overlap
            (start_time < p_end_time AND end_time > p_start_time)
        );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Classes table updated for enhanced schedule management!' as status;
SELECT 'Added campus_id, room_id, allow_public_enrollment, and conflict checking functions.' as info;