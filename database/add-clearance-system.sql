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

-- Clearance Types Table
-- Defines different types of clearances that organizations might require
CREATE TABLE clearance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100), -- e.g., 'background_check', 'certification', 'training'
    is_required_by_default BOOLEAN DEFAULT FALSE,
    expires BOOLEAN DEFAULT TRUE, -- whether this clearance type expires
    default_validity_months INTEGER, -- default months before expiration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization Clearance Requirements
-- Links organizations to the clearances they require
CREATE TABLE organization_clearance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    clearance_type_id UUID REFERENCES clearance_types(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    custom_validity_months INTEGER, -- override default validity period
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, clearance_type_id)
);

-- Teacher Clearances
-- Tracks which clearances each teacher has
CREATE TABLE teacher_clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    clearance_type_id UUID REFERENCES clearance_types(id) ON DELETE CASCADE,
    issued_date DATE NOT NULL,
    expiration_date DATE,
    issuing_authority VARCHAR(255),
    certificate_number VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),
    notes TEXT,
    document_url VARCHAR(500), -- optional link to uploaded document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Organization Eligibility (computed view or function)
-- This helps quickly determine if a teacher can work at an organization
CREATE OR REPLACE VIEW teacher_organization_eligibility AS
SELECT 
    up.id as teacher_id,
    up.first_name,
    up.last_name,
    up.email,
    o.id as organization_id,
    o.name as organization_name,
    COUNT(ocr.id) as required_clearances,
    COUNT(CASE 
        WHEN tc.status = 'active' 
        AND (tc.expiration_date IS NULL OR tc.expiration_date > CURRENT_DATE) 
        THEN 1 
    END) as valid_clearances,
    (COUNT(ocr.id) = COUNT(CASE 
        WHEN tc.status = 'active' 
        AND (tc.expiration_date IS NULL OR tc.expiration_date > CURRENT_DATE) 
        THEN 1 
    END)) as is_eligible
FROM user_profiles up
CROSS JOIN organizations o
LEFT JOIN organization_clearance_requirements ocr ON o.id = ocr.organization_id
LEFT JOIN teacher_clearances tc ON up.id = tc.teacher_id 
    AND ocr.clearance_type_id = tc.clearance_type_id
WHERE up.profile_type = 'teacher' 
    AND up.is_active = TRUE
    AND o.is_active = TRUE
GROUP BY up.id, up.first_name, up.last_name, up.email, o.id, o.name;

-- Insert some common clearance types
INSERT INTO clearance_types (name, description, category, expires, default_validity_months) VALUES
('Background Check', 'Standard background check for working with minors', 'background_check', TRUE, 12),
('CPR Certification', 'Current CPR and First Aid certification', 'certification', TRUE, 24),
('Child Protection Training', 'Training in child protection and safety protocols', 'training', TRUE, 36),
('Teaching License', 'State teaching license or certification', 'certification', TRUE, 60),
('Music Education Degree', 'Degree in music education or related field', 'certification', FALSE, NULL),
('Safeguarding Training', 'Specialized safeguarding training for educational environments', 'training', TRUE, 12);

-- Add indexes for better performance
CREATE INDEX idx_teacher_clearances_teacher_id ON teacher_clearances(teacher_id);
CREATE INDEX idx_teacher_clearances_clearance_type ON teacher_clearances(clearance_type_id);
CREATE INDEX idx_teacher_clearances_status ON teacher_clearances(status);
CREATE INDEX idx_teacher_clearances_expiration ON teacher_clearances(expiration_date);
CREATE INDEX idx_org_clearance_req_org_id ON organization_clearance_requirements(organization_id);
CREATE INDEX idx_org_clearance_req_clearance_type ON organization_clearance_requirements(clearance_type_id);