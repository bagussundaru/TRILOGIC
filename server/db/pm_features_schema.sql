-- ============================================
-- SMART TRILOGIC - PM Features Schema
-- Version: 3.0 (PM Complete Toolkit)
-- ============================================

-- ============================================
-- Phase G: RAB (Rencana Anggaran Biaya)
-- ============================================
CREATE TABLE IF NOT EXISTS rab_versions (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    version_number INT DEFAULT 1,
    version_name VARCHAR(100),
    total_material DECIMAL(18,2) DEFAULT 0,
    total_labor DECIMAL(18,2) DEFAULT 0,
    total_equipment DECIMAL(18,2) DEFAULT 0,
    total_overhead DECIMAL(18,2) DEFAULT 0,
    total_profit DECIMAL(18,2) DEFAULT 0,
    grand_total DECIMAL(18,2) DEFAULT 0,
    status ENUM('Draft', 'Submitted', 'Approved', 'Revised') DEFAULT 'Draft',
    approved_by CHAR(36),
    approved_date DATE,
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rab_items (
    id CHAR(36) PRIMARY KEY,
    rab_version_id CHAR(36) NOT NULL,
    wbs_id CHAR(36),
    category ENUM('Material', 'Upah', 'Alat', 'Overhead', 'Profit') DEFAULT 'Material',
    item_code VARCHAR(50),
    description TEXT NOT NULL,
    specification TEXT,
    unit VARCHAR(20) NOT NULL,
    volume DECIMAL(15,4) DEFAULT 0,
    unit_price DECIMAL(18,2) DEFAULT 0,
    total_price DECIMAL(18,2) DEFAULT 0,
    markup_pct DECIMAL(5,2) DEFAULT 0,
    final_price DECIMAL(18,2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rab_version_id) REFERENCES rab_versions(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs_items(id) ON DELETE SET NULL
);

-- ============================================
-- Phase H: Material Price Tracker
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    category ENUM('Material', 'Alat', 'Subkon', 'Jasa') DEFAULT 'Material',
    rating DECIMAL(2,1) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_master (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    category ENUM('Beton', 'Besi', 'Pasir Agregat', 'Semen', 'Bata', 'Keramik', 'Sanitair', 'MEP', 'Cat', 'Kayu', 'Atap', 'Pintu Jendela', 'Lainnya') DEFAULT 'Lainnya',
    specifications TEXT,
    min_stock DECIMAL(15,4) DEFAULT 0,
    default_supplier_id CHAR(36),
    last_price DECIMAL(18,2) DEFAULT 0,
    last_price_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (default_supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS material_prices (
    id CHAR(36) PRIMARY KEY,
    material_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    effective_date DATE NOT NULL,
    source ENUM('Manual', 'WhatsApp', 'API', 'Web Scrape') DEFAULT 'Manual',
    verified BOOLEAN DEFAULT FALSE,
    verified_by CHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES material_master(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_material_date (material_id, effective_date),
    INDEX idx_supplier_date (supplier_id, effective_date)
);

-- ============================================
-- Phase I: WhatsApp AI Message Logs
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id CHAR(36) PRIMARY KEY,
    supplier_id CHAR(36),
    direction ENUM('Outgoing', 'Incoming') NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    parsed_data JSON,
    status ENUM('Sent', 'Delivered', 'Read', 'Failed') DEFAULT 'Sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS price_check_schedules (
    id CHAR(36) PRIMARY KEY,
    material_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    frequency ENUM('Daily', 'Weekly', 'Monthly') DEFAULT 'Weekly',
    last_check DATE,
    next_check DATE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (material_id) REFERENCES material_master(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- ============================================
-- Phase J: RFI (Request for Information)
-- ============================================
CREATE TABLE IF NOT EXISTS rfis (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    rfi_number VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    wbs_id CHAR(36),
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Draft', 'Submitted', 'Under Review', 'Answered', 'Closed') DEFAULT 'Draft',
    submitted_to ENUM('Arsitek', 'Struktur', 'MEP', 'Owner', 'Konsultan') DEFAULT 'Konsultan',
    submitted_date DATE,
    due_date DATE,
    answered_date DATE,
    response TEXT,
    attachments JSON,
    created_by CHAR(36),
    answered_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs_items(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (answered_by) REFERENCES users(id)
);

-- ============================================
-- Phase K: Issue & NCR Tracker
-- ============================================
CREATE TABLE IF NOT EXISTS issues (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    issue_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    issue_type ENUM('Quality', 'Safety', 'Design', 'Material', 'Schedule', 'Other') DEFAULT 'Quality',
    severity ENUM('Minor', 'Major', 'Critical') DEFAULT 'Minor',
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled') DEFAULT 'Open',
    wbs_id CHAR(36),
    location VARCHAR(255),
    reported_by CHAR(36),
    assigned_to CHAR(36),
    root_cause TEXT,
    corrective_action TEXT,
    due_date DATE,
    resolved_date DATE,
    photos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs_items(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- ============================================
-- Phase L: Meeting Minutes
-- ============================================
CREATE TABLE IF NOT EXISTS meetings (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    meeting_type ENUM('Kick-off', 'Progress Weekly', 'Progress Monthly', 'Site', 'Technical', 'Coordination', 'Handover', 'Other') DEFAULT 'Progress Weekly',
    meeting_number INT DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    meeting_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    attendees JSON,
    agenda TEXT,
    minutes TEXT,
    decisions TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS action_items (
    id CHAR(36) PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    project_id CHAR(36) NOT NULL,
    description TEXT NOT NULL,
    assigned_to CHAR(36),
    assigned_to_name VARCHAR(100),
    due_date DATE,
    status ENUM('Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled') DEFAULT 'Open',
    completed_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- ============================================
-- Phase M: Material Delivery Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS material_orders (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery DATE,
    actual_delivery DATE,
    total_amount DECIMAL(18,2) DEFAULT 0,
    status ENUM('Draft', 'Ordered', 'Shipped', 'Partial Delivery', 'Delivered', 'Inspected', 'Accepted', 'Rejected') DEFAULT 'Draft',
    delivery_note TEXT,
    inspection_notes TEXT,
    inspected_by CHAR(36),
    photos JSON,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (inspected_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS material_order_items (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    material_id CHAR(36) NOT NULL,
    ordered_qty DECIMAL(15,4) DEFAULT 0,
    delivered_qty DECIMAL(15,4) DEFAULT 0,
    accepted_qty DECIMAL(15,4) DEFAULT 0,
    unit_price DECIMAL(18,2) DEFAULT 0,
    status ENUM('Ordered', 'Delivered', 'Partial', 'Inspected', 'Accepted', 'Rejected') DEFAULT 'Ordered',
    rejection_reason TEXT,
    FOREIGN KEY (order_id) REFERENCES material_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES material_master(id)
);

-- ============================================
-- Phase N: Subcontractor Performance
-- ============================================
CREATE TABLE IF NOT EXISTS subcontractors (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    npwp VARCHAR(50),
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    specialization ENUM('Struktur', 'Arsitektur', 'MEP Elektrikal', 'MEP Plumbing', 'MEP HVAC', 'Landscape', 'Interior', 'Lainnya') DEFAULT 'Lainnya',
    overall_rating DECIMAL(2,1) DEFAULT 0,
    total_projects INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcontractor_assignments (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    subcontractor_id CHAR(36) NOT NULL,
    wbs_id CHAR(36),
    scope_description TEXT,
    contract_value DECIMAL(18,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status ENUM('Active', 'Completed', 'Terminated') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id),
    FOREIGN KEY (wbs_id) REFERENCES wbs_items(id)
);

CREATE TABLE IF NOT EXISTS subcontractor_ratings (
    id CHAR(36) PRIMARY KEY,
    assignment_id CHAR(36) NOT NULL,
    rating_date DATE NOT NULL,
    quality_score DECIMAL(2,1) DEFAULT 0,
    schedule_score DECIMAL(2,1) DEFAULT 0,
    safety_score DECIMAL(2,1) DEFAULT 0,
    cooperation_score DECIMAL(2,1) DEFAULT 0,
    overall_score DECIMAL(2,1) DEFAULT 0,
    comments TEXT,
    rated_by CHAR(36),
    FOREIGN KEY (assignment_id) REFERENCES subcontractor_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_by) REFERENCES users(id)
);

-- ============================================
-- Phase O: Smart Alerts
-- ============================================
CREATE TABLE IF NOT EXISTS alert_rules (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36),
    alert_type ENUM('Progress Delay', 'Budget Overrun', 'Payment Due', 'Material Stock Low', 'RFI Overdue', 'Issue Critical', 'Subcon Rating Low', 'Weather Alert') NOT NULL,
    threshold_value DECIMAL(10,2),
    threshold_unit VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    notify_via ENUM('Email', 'WhatsApp', 'Push', 'All') DEFAULT 'All',
    recipients JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity ENUM('Info', 'Warning', 'Critical') DEFAULT 'Warning',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity VARCHAR(50),
    related_id CHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
