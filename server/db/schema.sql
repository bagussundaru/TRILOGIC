-- Smart TRILOGIC PMO Database Schema
-- MySQL 8.0+

-- Drop existing tables (for fresh install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS automation_rules;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS resource_allocations;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Authentication & Roles)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('CEO', 'CFO', 'CTO', 'PMO_Director', 'Project_Manager', 'Team_Lead', 'Engineer', 'Finance', 'Viewer') NOT NULL DEFAULT 'Viewer',
    department VARCHAR(100),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Projects Table (Implementations)
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('IT', 'Construction', 'Hybrid') NOT NULL DEFAULT 'IT',
    status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Planning',
    health_status ENUM('Healthy', 'On Track', 'At Risk', 'Critical') DEFAULT 'On Track',
    priority ENUM('Low', 'Medium', 'High', 'Critical', 'Urgent') DEFAULT 'Medium',
    
    -- Financials
    budget_allocated DECIMAL(15, 2) DEFAULT 0,
    budget_spent DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Timeline
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    
    -- Progress
    completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Location
    customer_region VARCHAR(100),
    location VARCHAR(255),
    
    -- Ownership
    owner_id VARCHAR(36),
    pm_id VARCHAR(36),
    sponsor_id VARCHAR(36),
    
    -- Metadata
    tags JSON,
    custom_fields JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (pm_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sponsor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Tasks Table
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    parent_task_id VARCHAR(36) NULL,
    
    task_code VARCHAR(20),
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    status ENUM('To Do', 'In Progress', 'In Review', 'Done', 'Blocked') DEFAULT 'To Do',
    priority ENUM('Low', 'Medium', 'High', 'Critical', 'Urgent') DEFAULT 'Medium',
    
    assignee_id VARCHAR(36),
    reviewer_id VARCHAR(36),
    
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2),
    
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    
    tags JSON,
    attachments JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Resources Table
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    type ENUM('Human', 'Machine', 'Digital', 'Other') NOT NULL DEFAULT 'Human',
    
    -- For Human resources
    user_id VARCHAR(36),
    role VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Capacity
    capacity_hours_per_month INT DEFAULT 160,
    hourly_rate DECIMAL(10, 2),
    
    -- Skills (for humans)
    skills JSON,
    certifications JSON,
    
    -- Status
    status ENUM('Available', 'Partially Available', 'Busy', 'Overloaded', 'On Leave', 'Inactive') DEFAULT 'Available',
    
    -- For Machine/Digital resources
    specifications JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Resource Allocations Table
CREATE TABLE resource_allocations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    resource_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    
    allocated_hours DECIMAL(8, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    allocation_percentage INT DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    
    status ENUM('Planned', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planned',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- 6. Risks Table
CREATE TABLE risks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Technical', 'Financial', 'Operational', 'External', 'Resource', 'Schedule', 'Scope', 'Other') DEFAULT 'Other',
    
    probability ENUM('Very Low', 'Low', 'Medium', 'High', 'Very High') DEFAULT 'Medium',
    impact ENUM('Very Low', 'Low', 'Medium', 'High', 'Very High') DEFAULT 'Medium',
    risk_score INT GENERATED ALWAYS AS (
        (CASE probability 
            WHEN 'Very Low' THEN 1 
            WHEN 'Low' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'High' THEN 4 
            WHEN 'Very High' THEN 5 
        END) * 
        (CASE impact 
            WHEN 'Very Low' THEN 1 
            WHEN 'Low' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'High' THEN 4 
            WHEN 'Very High' THEN 5 
        END)
    ) STORED,
    
    status ENUM('Identified', 'Analyzing', 'Mitigating', 'Resolved', 'Closed', 'Accepted') DEFAULT 'Identified',
    
    mitigation_plan TEXT,
    contingency_plan TEXT,
    
    owner_id VARCHAR(36),
    identified_date DATE DEFAULT (CURRENT_DATE),
    target_resolution_date DATE,
    actual_resolution_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Activity Logs Table (Audit Trail)
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    user_id VARCHAR(36),
    action_type ENUM('Created', 'Updated', 'Deleted', 'Status Changed', 'Document Uploaded', 'Risk Added', 'Task Completed', 'Milestone Reached', 'Comment Added', 'Login', 'Logout') NOT NULL,
    
    entity_type ENUM('Project', 'Task', 'Resource', 'Risk', 'User', 'Allocation', 'System') NOT NULL,
    entity_id VARCHAR(36),
    
    description TEXT NOT NULL,
    old_value JSON,
    new_value JSON,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Automation Rules Table
CREATE TABLE automation_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    trigger_type ENUM('Status Change', 'Budget Threshold', 'Deadline Approaching', 'Risk Level', 'Resource Overload', 'Task Completion', 'Schedule') NOT NULL,
    trigger_conditions JSON NOT NULL,
    
    action_type ENUM('Send Notification', 'Update Status', 'Assign Resource', 'Create Task', 'Escalate', 'Send Email', 'Webhook') NOT NULL,
    action_config JSON NOT NULL,
    
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INT DEFAULT 0,
    last_executed_at TIMESTAMP NULL,
    
    tags JSON,
    
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    user_id VARCHAR(36) NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    type ENUM('Info', 'Success', 'Warning', 'Error', 'Alert') DEFAULT 'Info',
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(36),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    action_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_health ON projects(health_status);
CREATE INDEX idx_projects_pm ON projects(pm_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_allocations_resource ON resource_allocations(resource_id);
CREATE INDEX idx_allocations_project ON resource_allocations(project_id);
CREATE INDEX idx_risks_project ON risks(project_id);
CREATE INDEX idx_risks_score ON risks(risk_score);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, department) VALUES
(UUID(), 'admin@trilogic.id', '$2a$10$rQnM1.X7GWqj5.VJ7.LqXOQJYWHh7dV8yYu8Zy1.zV7n8YW3bKmHe', 'System Administrator', 'PMO_Director', 'PMO');

-- Insert sample data
INSERT INTO users (id, email, password_hash, full_name, role, department) VALUES
(UUID(), 'ceo@pln.co.id', '$2a$10$rQnM1.X7GWqj5.VJ7.LqXOQJYWHh7dV8yYu8Zy1.zV7n8YW3bKmHe', 'Direktur Utama', 'CEO', 'Executive'),
(UUID(), 'pmo@pln.co.id', '$2a$10$rQnM1.X7GWqj5.VJ7.LqXOQJYWHh7dV8yYu8Zy1.zV7n8YW3bKmHe', 'PMO Director', 'PMO_Director', 'PMO'),
(UUID(), 'pm.ahmad@pln.co.id', '$2a$10$rQnM1.X7GWqj5.VJ7.LqXOQJYWHh7dV8yYu8Zy1.zV7n8YW3bKmHe', 'Ahmad Rizki', 'Project_Manager', 'IT');
