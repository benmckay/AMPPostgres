-- Sample data for Access Request Management Dashboard
-- Run this after creating the schema

-- Insert departments
INSERT INTO departments (name, code, manager_email, description) VALUES
('Information Technology', 'IT', 'it.manager@company.com', 'Manages all technology infrastructure and systems'),
('Finance', 'FIN', 'finance.manager@company.com', 'Handles financial operations and reporting'),
('Marketing', 'MKT', 'marketing.manager@company.com', 'Marketing and brand management'),
('Legal', 'LEG', 'legal.manager@company.com', 'Legal affairs and compliance'),
('Customer Service', 'CS', 'cs.manager@company.com', 'Customer support and service operations'),
('Human Resources', 'HR', 'hr.manager@company.com', 'Human resources and employee management');

SELECT * FROM departments;

-- Insert systems
INSERT INTO systems (name, code, description, owner_department_id, max_processing_hours) VALUES
('System A', 'SYS-A', 'Core business application system', 1, 48),
('Account Management', 'ACC-MGT', 'Customer account management system', 2, 24),
('Data Reporting', 'DATA-RPT', 'Business intelligence and reporting system', 1, 72),
('CRM System', 'CRM', 'Customer relationship management system', 5, 36),
('HR Portal', 'HR-PRT', 'Human resources management portal', 6, 24),
('Financial Dashboard', 'FIN-DASH', 'Financial reporting and analytics dashboard', 2, 48);

SELECT * FROM systems;

-- Insert users
INSERT INTO users (email, first_name, last_name, department_id, employee_id, role, can_approve) VALUES
-- IT Department
('john.doe@company.com', 'John', 'Doe', 1, 'EMP001', 'Manager', true),
('jane.smith@company.com', 'Jane', 'Smith', 1, 'EMP002', 'Senior Developer', true),
('mike.wilson@company.com', 'Mike', 'Wilson', 1, 'EMP003', 'System Admin', false),

-- Finance Department
('sarah.johnson@company.com', 'Sarah', 'Johnson', 2, 'EMP004', 'Finance Manager', true),
('david.brown@company.com', 'David', 'Brown', 2, 'EMP005', 'Financial Analyst', false),
('lisa.davis@company.com', 'Lisa', 'Davis', 2, 'EMP006', 'Accountant', false),

-- Marketing Department
('emma.taylor@company.com', 'Emma', 'Taylor', 3, 'EMP007', 'Marketing Manager', true),
('chris.anderson@company.com', 'Chris', 'Anderson', 3, 'EMP008', 'Marketing Specialist', false),
('alex.martinez@company.com', 'Alex', 'Martinez', 3, 'EMP009', 'Content Creator', false),

-- Legal Department
('robert.clark@company.com', 'Robert', 'Clark', 4, 'EMP010', 'Legal Counsel', true),
('michelle.lee@company.com', 'Michelle', 'Lee', 4, 'EMP011', 'Paralegal', false),

-- Customer Service Department
('amanda.white@company.com', 'Amanda', 'White', 5, 'EMP012', 'CS Manager', true),
('kevin.garcia@company.com', 'Kevin', 'Garcia', 5, 'EMP013', 'Support Specialist', false),
('rachel.miller@company.com', 'Rachel', 'Miller', 5, 'EMP014', 'Support Agent', false),

-- HR Department
('jennifer.wilson@company.com', 'Jennifer', 'Wilson', 6, 'EMP015', 'HR Manager', true),
('thomas.moore@company.com', 'Thomas', 'Moore', 6, 'EMP016', 'HR Specialist', false);

SELECT * FROM users;
SELECT id, first_name, last_name, department_id FROM users;

-- Insert access requests (spanning last 6 months)
INSERT INTO access_requests (
    requester_id, department_id, system_id, request_type, priority, status,
    title, description, business_justification, access_level,
    submitted_at, assigned_to, processing_time_hours, sla_met,
    created_by, updated_by
) VALUES
-- Recent requests (last 30 days)
(3, 1, 1, 'System Access', 'High', 'Approved', 
 'Access to System A for maintenance', 'Need access to perform system maintenance tasks', 
 'Critical system maintenance required', 'Admin', 
 CURRENT_TIMESTAMP - INTERVAL '2 days', 1, 18, true, 3, 1),

(5, 2, 2, 'Account Management', 'Medium', 'Pending', 
 'Customer account access', 'Need access to manage customer accounts', 
 'New role requires customer account management', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '3 days', 4, NULL, NULL, 5, 5),

(8, 3, 3, 'Data Reporting', 'Medium', 'Rejected', 
 'Marketing analytics access', 'Request access to marketing data reports', 
 'Need data for campaign analysis', 'Read-only', 
 CURRENT_TIMESTAMP - INTERVAL '5 days', 1, 48, true, 8, 1),

(11, 4, 1, 'System Access', 'Low', 'Approved', 
 'Legal document system access', 'Access to legal document management system', 
 'Required for contract review process', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '7 days', 10, 36, true, 11, 10),

(13, 5, 4, 'System Access', 'Medium', 'Cancelled', 
 'CRM system access', 'Customer relationship management system access', 
 'Customer support role requirements', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '10 days', 12, 12, true, 13, 13),

-- Older requests (1-6 months ago)
(6, 2, 6, 'Data Reporting', 'High', 'Approved', 
 'Financial dashboard access', 'Access to financial reporting dashboard', 
 'Monthly financial reporting requirements', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '15 days', 4, 24, true, 6, 4),

(9, 3, 3, 'Data Reporting', 'Medium', 'Approved', 
 'Marketing data access', 'Access to marketing analytics platform', 
 'Campaign performance analysis', 'Read-only', 
 CURRENT_TIMESTAMP - INTERVAL '20 days', 1, 48, true, 9, 1),

(14, 5, 4, 'Account Management', 'Medium', 'Pending', 
 'Customer support CRM', 'CRM access for customer support', 
 'Handle customer inquiries effectively', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '25 days', 12, NULL, NULL, 14, 14),

(16, 6, 5, 'System Access', 'Low', 'Approved', 
 'HR portal access', 'Human resources portal access', 
 'Employee data management', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '30 days', 15, 18, true, 16, 15),

(2, 1, 1, 'System Access', 'Critical', 'Approved', 
 'Emergency system access', 'Emergency access to System A', 
 'Critical system issue resolution', 'Admin', 
 CURRENT_TIMESTAMP - INTERVAL '45 days', 1, 2, true, 2, 1),

-- More historical data for trends
(7, 3, 3, 'Data Reporting', 'Medium', 'Rejected', 
 'Campaign analytics', 'Access to campaign performance data', 
 'Marketing campaign optimization', 'Read-only', 
 CURRENT_TIMESTAMP - INTERVAL '60 days', 1, 72, true, 7, 1),

(12, 5, 4, 'System Access', 'High', 'Approved', 
 'Senior support CRM access', 'Advanced CRM system access', 
 'Senior support role requirements', 'Advanced', 
 CURRENT_TIMESTAMP - INTERVAL '75 days', 12, 30, true, 12, 12),

(4, 2, 2, 'Account Management', 'Medium', 'Approved', 
 'Account management system', 'Customer account management access', 
 'New finance role requirements', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '90 days', 4, 24, true, 4, 4),

(15, 6, 5, 'System Access', 'Low', 'Cancelled', 
 'HR system access', 'Human resources system access', 
 'Employee record management', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '120 days', 15, 6, true, 15, 15),

(10, 4, 1, 'System Access', 'Medium', 'Approved', 
 'Legal system access', 'Access to legal document system', 
 'Contract management requirements', 'Standard', 
 CURRENT_TIMESTAMP - INTERVAL '150 days', 10, 42, true, 10, 10);

 SELECT * FROM access_requests;

-- Insert request comments
INSERT INTO request_comments (request_id, user_id, comment_type, comment, is_internal) VALUES
(1, 1, 'Approval', 'Access granted for system maintenance. Please ensure proper backup procedures.', false),
(3, 1, 'Rejection', 'Insufficient business justification provided. Please resubmit with more details.', false),
(19, 10, 'Approval', 'Legal access approved for contract review purposes.', false),
(5, 13, 'General', 'Request no longer needed due to role change.', false),
(29, 4, 'Approval', 'Financial dashboard access approved for reporting duties.', false),
(7, 1, 'System', 'System automatically assigned based on request type.', true),
(9, 15, 'Approval', 'HR portal access granted for employee management.', false);

SELECT * FROM request_comments;

-- Insert approval workflows
INSERT INTO approval_workflows (request_id, approver_id, approval_level, status, approved_at, comments) VALUES
(1, 1, 1, 'Approved', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Approved for maintenance purposes'),
(3, 1, 1, 'Rejected', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Need more business justification'),
(19, 10, 1, 'Approved', CURRENT_TIMESTAMP - INTERVAL '6 days', 'Legal access approved'),
(29, 4, 1, 'Approved', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Financial reporting access approved'),
(9, 15, 1, 'Approved', CURRENT_TIMESTAMP - INTERVAL '29 days', 'HR access approved'),
(11, 1, 1, 'Approved', CURRENT_TIMESTAMP - INTERVAL '44 days', 'Emergency access granted'),
(23, 12, 1, 'Approved', CURRENT_TIMESTAMP - INTERVAL '74 days', 'Senior support access approved');

SELECT * FROM approval_workflows;

-- Update some requests to have realistic processing times and completion dates
UPDATE access_requests 
SET 
    completed_at = submitted_at + (processing_time_hours || ' hours')::INTERVAL,
    approved_at = CASE WHEN status = 'Approved' THEN submitted_at + (processing_time_hours || ' hours')::INTERVAL END,
    rejected_at = CASE WHEN status = 'Rejected' THEN submitted_at + (processing_time_hours || ' hours')::INTERVAL END,
    cancelled_at = CASE WHEN status = 'Cancelled' THEN submitted_at + (processing_time_hours || ' hours')::INTERVAL END
WHERE processing_time_hours IS NOT NULL;

-- Insert some sample audit logs
INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, ip_address) VALUES
('access_requests', 1, 'UPDATE', 
 '{"status": "Pending"}', 
 '{"status": "Approved"}', 
 1, '192.168.1.100'),
('access_requests', 3, 'UPDATE', 
 '{"status": "Pending"}', 
 '{"status": "Rejected"}', 
 1, '192.168.1.100'),
('users', 5, 'UPDATE', 
 '{"department_id": 1}', 
 '{"department_id": 2}', 
 1, '192.168.1.100');

-- Create some additional sample data for better dashboard visualization
-- Insert more requests to have sufficient data for monthly trends
DO $$
DECLARE
    i INTEGER;
    random_user INTEGER;
    random_dept INTEGER;
    random_system INTEGER;
    random_status request_status;
    random_priority request_priority;
    request_date TIMESTAMP;
BEGIN
    FOR i IN 1..50 LOOP
        -- Random selections
        random_user := (SELECT id FROM users ORDER BY random() LIMIT 1);
        random_dept := (SELECT id FROM departments ORDER BY random() LIMIT 1);
        random_system := (SELECT id FROM systems ORDER BY random() LIMIT 1);
        random_status := (ARRAY['Pending', 'Approved', 'Rejected', 'Cancelled']::request_status[])[floor(random() * 4 + 1)];
        random_priority := (ARRAY['Low', 'Medium', 'High', 'Critical']::request_priority[])[floor(random() * 4 + 1)];
        request_date := CURRENT_TIMESTAMP - (random() * 180 || ' days')::INTERVAL;
        
        INSERT INTO access_requests (
            requester_id, department_id, system_id, request_type, priority, status,
            title, description, business_justification, access_level,
            submitted_at, processing_time_hours, sla_met,
            created_by, updated_by
        ) VALUES (
            random_user, random_dept, random_system, 
            (ARRAY['System Access', 'Account Management', 'Data Reporting', 'Miscellaneous']::request_type[])[floor(random() * 4 + 1)],
            random_priority, random_status,
            'Sample Request ' || i,
            'Sample description for request ' || i,
            'Business justification for request ' || i,
            (ARRAY['Standard', 'Admin', 'Read-only', 'Advanced'])[floor(random() * 4 + 1)],
            request_date,
            CASE WHEN random_status IN ('Approved', 'Rejected', 'Cancelled') 
                 THEN floor(random() * 96 + 1)::INTEGER 
                 ELSE NULL END,
            CASE WHEN random_status IN ('Approved', 'Rejected', 'Cancelled') 
                 THEN (random() > 0.2) 
                 ELSE NULL END,
            random_user, random_user
        );
    END LOOP;
END $$;

SELECT * FROM audit_logs;
-- Update completion timestamps for the new sample data
UPDATE access_requests 
SET 
    completed_at = submitted_at + (processing_time_hours || ' hours')::INTERVAL,
    approved_at = CASE WHEN status = 'Approved' THEN submitted_at + (processing_time_hours || ' hours')::INTERVAL END,
    rejected_at = CASE WHEN status = 'Rejected' THEN submitted_at + (processing_time_hours || ' hours')::INTERVAL END,
    cancelled_at = CASE WHEN status = 'Cancelled' THEN submitted_at + (processing_time_hours || ' hours')::INTERVAL END
WHERE processing_time_hours IS NOT NULL AND completed_at IS NULL;