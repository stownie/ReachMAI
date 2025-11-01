-- Add Campus Rooms Table
-- This script adds a table for storing multiple rooms per campus
-- Rooms can have capacity, equipment, and availability information

-- Create campus_rooms table
CREATE TABLE IF NOT EXISTS campus_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,              -- Room name/number (e.g., "Room 101", "Main Hall")
    room_type VARCHAR(100),                  -- Optional: Type (classroom, lab, auditorium, office, etc.)
    capacity INTEGER,                        -- Optional: Maximum occupancy
    equipment TEXT,                          -- Optional: Equipment/amenities (projector, whiteboard, etc.)
    notes TEXT,                             -- Optional: Additional notes
    is_active BOOLEAN DEFAULT true,          -- Whether room is available for use
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campus_rooms_campus_id ON campus_rooms(campus_id);
CREATE INDEX IF NOT EXISTS idx_campus_rooms_is_active ON campus_rooms(campus_id, is_active);
CREATE INDEX IF NOT EXISTS idx_campus_rooms_type ON campus_rooms(room_type);

-- Add trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campus_rooms_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS campus_rooms_updated_at ON campus_rooms;
CREATE TRIGGER campus_rooms_updated_at
    BEFORE UPDATE ON campus_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_campus_rooms_updated_at();

-- Add helpful comments
COMMENT ON TABLE campus_rooms IS 'Rooms within campuses - supports multiple rooms per campus with capacity and equipment info';
COMMENT ON COLUMN campus_rooms.name IS 'Room name or number (required)';
COMMENT ON COLUMN campus_rooms.room_type IS 'Optional room type (classroom, lab, auditorium, office, etc.)';
COMMENT ON COLUMN campus_rooms.capacity IS 'Optional maximum occupancy number';
COMMENT ON COLUMN campus_rooms.equipment IS 'Optional equipment and amenities description';
COMMENT ON COLUMN campus_rooms.notes IS 'Optional additional notes about the room';
COMMENT ON COLUMN campus_rooms.is_active IS 'Whether room is available for use';

-- Success message
SELECT 'Campus rooms table created successfully!' as status;
SELECT 'You can now add multiple rooms to campuses with capacity and equipment details.' as info;