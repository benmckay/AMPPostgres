-- Access Request Management Dashboard Database Schema
-- PostgreSQL Database Schema

-- Create database
-- CREATE DATABASE access_request_db;
DROP DATABASE access_request_db;   --mine now is postgres

-- Use the database
-- \c access_request_db; ---postgres db

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE request_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');
CREATE TYPE request_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE request_type AS ENUM ('System Access', 'Account Management', 'Data Reporting', 'Miscellaneous');

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    manager_email VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Systems table
CREATE TABLE systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    owner_department_id INTEGER REFERENCES departments(id),
    requires_approval BOOLEAN DEFAULT TRUE,
    max_processing_hours INTEGER DEFAULT 72,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for requesters and approvers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    employee_id VARCHAR(50) UNIQUE,
    role VARCHAR(50) DEFAULT 'Employee',
    is_active BOOLEAN DEFAULT TRUE,
    can_approve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Access requests table
CREATE TABLE access_requests (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    request_id VARCHAR(50) NOT NULL UNIQUE,
    requester_id INTEGER NOT NULL REFERENCES users(id),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    system_id INTEGER NOT NULL REFERENCES systems(id),
    request_type request_type NOT NULL DEFAULT 'System Access',
    priority request_priority DEFAULT 'Medium',
    status request_status DEFAULT 'Pending',
    
    -- Request details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_justification TEXT,
    access_level VARCHAR(100),
    temporary_access BOOLEAN DEFAULT FALSE,
    access_start_date DATE,
    access_end_date DATE,
    
    -- Workflow tracking
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Processing metrics
    processing_time_hours INTEGER,
    sla_met BOOLEAN,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Request comments/notes table
CREATE TABLE request_comments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES access_requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    comment_type VARCHAR(50) DEFAULT 'General', -- General, Approval, Rejection, System
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Request attachments table
CREATE TABLE request_attachments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES access_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval workflow table
CREATE TABLE approval_workflows (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES access_requests(id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(id),
    approval_level INTEGER DEFAULT 1,
    status request_status DEFAULT 'Pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_department ON access_requests(department_id);
CREATE INDEX idx_access_requests_system ON access_requests(system_id);
CREATE INDEX idx_access_requests_requester ON access_requests(requester_id);
CREATE INDEX idx_access_requests_submitted_at ON access_requests(submitted_at);
CREATE INDEX idx_access_requests_request_id ON access_requests(request_id);
CREATE INDEX idx_access_requests_uuid ON access_requests(uuid);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);

CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_request_attachments_request_id ON request_attachments(request_id);
CREATE INDEX idx_approval_workflows_request_id ON approval_workflows(request_id);
CREATE INDEX idx_approval_workflows_approver ON approval_workflows(approver_id);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON systems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_requests_updated_at BEFORE UPDATE ON access_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate processing time
CREATE OR REPLACE FUNCTION calculate_processing_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate processing time when status changes to completed states
    IF NEW.status IN ('Approved', 'Rejected', 'Cancelled') AND OLD.status != NEW.status THEN
        NEW.processing_time_hours = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.submitted_at)) / 3600;
        
        -- Check if SLA was met (based on system's max_processing_hours)
        NEW.sla_met = NEW.processing_time_hours <= (
            SELECT max_processing_hours FROM systems WHERE id = NEW.system_id
        );
        
        -- Set completion timestamp
        IF NEW.status = 'Approved' THEN
            NEW.approved_at = CURRENT_TIMESTAMP;
        ELSIF NEW.status = 'Rejected' THEN
            NEW.rejected_at = CURRENT_TIMESTAMP;
        ELSIF NEW.status = 'Cancelled' THEN
            NEW.cancelled_at = CURRENT_TIMESTAMP;
        END IF;
        
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for processing time calculation
CREATE TRIGGER calculate_request_processing_time 
    BEFORE UPDATE ON access_requests 
    FOR EACH ROW EXECUTE FUNCTION calculate_processing_time();

-- Function to generate request ID
CREATE OR REPLACE FUNCTION generate_request_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_id IS NULL THEN
        NEW.request_id = 'REQ-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                        LPAD(nextval('access_requests_id_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for request ID generation
CREATE TRIGGER generate_access_request_id 
    BEFORE INSERT ON access_requests 
    FOR EACH ROW EXECUTE FUNCTION generate_request_id();

-- Create views for common queries

-- Dashboard metrics view
CREATE VIEW dashboard_metrics AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'Approved') as approved_requests,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_requests,
    COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled_requests,
    ROUND(AVG(processing_time_hours), 2) as avg_processing_time,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'Approved')::numeric / 
         NULLIF(COUNT(*) FILTER (WHERE status IN ('Approved', 'Rejected')), 0) * 100), 
        2
    ) as approval_rate,
    ROUND(
        (COUNT(*) FILTER (WHERE sla_met = true)::numeric / 
         NULLIF(COUNT(*) FILTER (WHERE status IN ('Approved', 'Rejected', 'Cancelled')), 0) * 100), 
        2
    ) as sla_met_rate
FROM access_requests
WHERE submitted_at >= CURRENT_DATE - INTERVAL '30 days';

-- Monthly trend view
CREATE VIEW monthly_request_trend AS
SELECT 
    DATE_TRUNC('month', submitted_at) as month,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'Approved') as approved_requests,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_requests,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_requests,
    ROUND(AVG(processing_time_hours), 2) as avg_processing_time
FROM access_requests
WHERE submitted_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', submitted_at)
ORDER BY month;

-- Department performance view
CREATE VIEW department_performance AS
SELECT 
    d.name as department_name,
    d.code as department_code,
    COUNT(ar.*) as total_requests,
    COUNT(*) FILTER (WHERE ar.status = 'Approved') as approved_requests,
    COUNT(*) FILTER (WHERE ar.status = 'Rejected') as rejected_requests,
    COUNT(*) FILTER (WHERE ar.status = 'Pending') as pending_requests,
    ROUND(AVG(ar.processing_time_hours), 2) as avg_processing_time,
    ROUND(
        (COUNT(*) FILTER (WHERE ar.status = 'Approved')::numeric / 
         NULLIF(COUNT(*) FILTER (WHERE ar.status IN ('Approved', 'Rejected')), 0) * 100), 
        2
    ) as approval_rate
FROM departments d
LEFT JOIN access_requests ar ON d.id = ar.department_id
WHERE ar.submitted_at >= CURRENT_DATE - INTERVAL '30 days' OR ar.submitted_at IS NULL
GROUP BY d.id, d.name, d.code
ORDER BY total_requests DESC;

-- System usage view
CREATE VIEW system_usage AS
SELECT 
    s.name as system_name,
    s.code as system_code,
    COUNT(ar.*) as total_requests,
    COUNT(*) FILTER (WHERE ar.status = 'Approved') as approved_requests,
    COUNT(*) FILTER (WHERE ar.status = 'Rejected') as rejected_requests,
    COUNT(*) FILTER (WHERE ar.status = 'Pending') as pending_requests,
    ROUND(AVG(ar.processing_time_hours), 2) as avg_processing_time,
    s.max_processing_hours as sla_hours,
    ROUND(
        (COUNT(*) FILTER (WHERE ar.sla_met = true)::numeric / 
         NULLIF(COUNT(*) FILTER (WHERE ar.status IN ('Approved', 'Rejected', 'Cancelled')), 0) * 100), 
        2
    ) as sla_met_rate
FROM systems s
LEFT JOIN access_requests ar ON s.id = ar.system_id
WHERE ar.submitted_at >= CURRENT_DATE - INTERVAL '30 days' OR ar.submitted_at IS NULL
GROUP BY s.id, s.name, s.code, s.max_processing_hours
ORDER BY total_requests DESC;