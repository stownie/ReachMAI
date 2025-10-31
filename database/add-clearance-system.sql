-- Add Clearance System to ReachMAI Database
-- This script adds tables for managing organization clearances and teacher certifications

-- Campuses Table
-- Organizations can have multiple campuses with different addresses
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "Main Campus", "Downtown Branch"
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE, -- one campus can be marked as primary
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for organization campuses
CREATE INDEX idx_campuses_organization_id ON campuses(organization_id);
CREATE INDEX idx_campuses_primary ON campuses(organization_id, is_primary) WHERE is_primary = TRUE;

-- Add clearance requirement field to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS requires_clearance BOOLEAN DEFAULT FALSE;

-- Simplified Teacher Clearance Status Tracking
-- Tracks clearance status for teachers at each organization
CREATE TABLE teacher_organization_clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    clearance_status VARCHAR(20) DEFAULT 'not_cleared' CHECK (clearance_status IN ('not_cleared', 'in_progress', 'submitted', 'cleared')),
    notes TEXT,
    submitted_date DATE,
    cleared_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, organization_id)
);

-- Add indexes for better performance
CREATE INDEX idx_teacher_org_clearances_teacher_id ON teacher_organization_clearances(teacher_id);
CREATE INDEX idx_teacher_org_clearances_org_id ON teacher_organization_clearances(organization_id);
CREATE INDEX idx_teacher_org_clearances_status ON teacher_organization_clearances(clearance_status);