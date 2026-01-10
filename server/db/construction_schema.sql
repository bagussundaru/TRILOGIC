-- ============================================
-- SMART TRILOGIC - Construction PMO Schema
-- Version: 2.0 (Construction Focus)
-- ============================================

-- Extend Projects table for Construction
-- Note: Run each ALTER separately, ignore errors if column exists
ALTER TABLE projects ADD COLUMN contract_type VARCHAR(50) DEFAULT 'Lump Sum';
ALTER TABLE projects ADD COLUMN contract_value DECIMAL(18,2);
ALTER TABLE projects ADD COLUMN retention_percentage DECIMAL(5,2) DEFAULT 5.00;
ALTER TABLE projects ADD COLUMN dp_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN contractor_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN consultant_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN owner_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN site_address TEXT;
ALTER TABLE projects ADD COLUMN building_type VARCHAR(50) DEFAULT 'Rumah Mewah';
ALTER TABLE projects ADD COLUMN total_sqm DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN floors_count INT DEFAULT 1;
ALTER TABLE projects ADD COLUMN construction_start DATE;
ALTER TABLE projects ADD COLUMN construction_end DATE;
ALTER TABLE projects ADD COLUMN handover_date DATE;

-- ============================================
-- WBS (Work Breakdown Structure)
-- ============================================
CREATE TABLE IF NOT EXISTS wbs_items (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    parent_id CHAR(36) DEFAULT NULL,
    wbs_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level INT DEFAULT 1,
    sequence INT DEFAULT 0,
    item_type ENUM('Summary', 'Work Package', 'Activity') DEFAULT 'Work Package',
    unit VARCHAR(20),
    planned_qty DECIMAL(15,4) DEFAULT 0,
    actual_qty DECIMAL(15,4) DEFAULT 0,
    unit_price DECIMAL(18,2) DEFAULT 0,
    weight_percentage DECIMAL(8,4) DEFAULT 0,
    planned_start DATE,
    planned_finish DATE,
    actual_start DATE,
    actual_finish DATE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    status ENUM('Not Started', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Not Started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES wbs_items(id) ON DELETE CASCADE,
    INDEX idx_project_wbs (project_id, wbs_code),
    INDEX idx_parent (parent_id)
);

-- ============================================
-- BOQ (Bill of Quantity)
-- ============================================
CREATE TABLE IF NOT EXISTS boq_items (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    wbs_id CHAR(36),
    boq_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    specification TEXT,
    unit VARCHAR(20) NOT NULL,
    contract_qty DECIMAL(15,4) DEFAULT 0,
    contract_price DECIMAL(18,2) DEFAULT 0,
    executed_qty DECIMAL(15,4) DEFAULT 0,
    variation_qty DECIMAL(15,4) DEFAULT 0,
    variation_price DECIMAL(18,2) DEFAULT 0,
    category ENUM('Pekerjaan Persiapan', 'Pekerjaan Tanah', 'Pekerjaan Struktur', 'Pekerjaan Arsitektur', 'Pekerjaan MEP', 'Pekerjaan Landscape', 'Pekerjaan Lainnya') DEFAULT 'Pekerjaan Struktur',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs_items(id) ON DELETE SET NULL,
    INDEX idx_project_boq (project_id, boq_code),
    INDEX idx_category (category)
);

-- ============================================
-- Progress Reports
-- ============================================
CREATE TABLE IF NOT EXISTS progress_reports (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    report_type ENUM('Daily', 'Weekly', 'Monthly') DEFAULT 'Monthly',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_number VARCHAR(50),
    planned_progress DECIMAL(5,2) DEFAULT 0,
    actual_progress DECIMAL(5,2) DEFAULT 0,
    planned_cost DECIMAL(18,2) DEFAULT 0,
    actual_cost DECIMAL(18,2) DEFAULT 0,
    pv DECIMAL(18,2) DEFAULT 0,
    ev DECIMAL(18,2) DEFAULT 0,
    ac DECIMAL(18,2) DEFAULT 0,
    summary TEXT,
    issues TEXT,
    next_period_plan TEXT,
    weather_impact TEXT,
    created_by CHAR(36),
    approved_by CHAR(36),
    status ENUM('Draft', 'Submitted', 'Approved', 'Rejected') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_project_period (project_id, period_start, period_end)
);

-- ============================================
-- Daily Reports
-- ============================================
CREATE TABLE IF NOT EXISTS daily_reports (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    report_date DATE NOT NULL,
    weather ENUM('Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Lebat', 'Badai') DEFAULT 'Cerah',
    work_start_time TIME,
    work_end_time TIME,
    total_workers INT DEFAULT 0,
    workers_detail JSON,
    equipment_onsite JSON,
    work_description TEXT,
    issues_encountered TEXT,
    photos JSON,
    site_engineer VARCHAR(100),
    project_manager VARCHAR(100),
    consultant_engineer VARCHAR(100),
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE INDEX idx_project_date (project_id, report_date)
);

-- ============================================
-- Payment Certificates
-- ============================================
CREATE TABLE IF NOT EXISTS payment_certificates (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    certificate_number VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    previous_certified DECIMAL(18,2) DEFAULT 0,
    this_period DECIMAL(18,2) DEFAULT 0,
    retention_amount DECIMAL(18,2) DEFAULT 0,
    ppn_amount DECIMAL(18,2) DEFAULT 0,
    pph_amount DECIMAL(18,2) DEFAULT 0,
    net_payment DECIMAL(18,2) DEFAULT 0,
    status ENUM('Draft', 'Submitted', 'Consultant Approved', 'Owner Approved', 'Paid', 'Rejected') DEFAULT 'Draft',
    submitted_date DATE,
    consultant_approval_date DATE,
    owner_approval_date DATE,
    payment_date DATE,
    attachments JSON,
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_cert (project_id, certificate_number)
);

-- ============================================
-- Materials Inventory
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    material_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    specification TEXT,
    unit VARCHAR(20) NOT NULL,
    budgeted_qty DECIMAL(15,4) DEFAULT 0,
    budgeted_price DECIMAL(18,2) DEFAULT 0,
    stock_qty DECIMAL(15,4) DEFAULT 0,
    min_stock DECIMAL(15,4) DEFAULT 0,
    supplier VARCHAR(255),
    category ENUM('Beton', 'Besi', 'Pasir Agregat', 'Semen', 'Bata', 'Keramik', 'Sanitair', 'MEP', 'Cat', 'Kayu', 'Lainnya') DEFAULT 'Lainnya',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_material (project_id, material_code)
);

-- ============================================
-- Purchase Orders
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_address TEXT,
    supplier_phone VARCHAR(50),
    po_date DATE NOT NULL,
    delivery_date DATE,
    total_amount DECIMAL(18,2) DEFAULT 0,
    status ENUM('Draft', 'Approved', 'Ordered', 'Partial', 'Delivered', 'Completed', 'Cancelled') DEFAULT 'Draft',
    items JSON,
    notes TEXT,
    created_by CHAR(36),
    approved_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_project_po (project_id, po_number)
);

-- ============================================
-- Site Photos
-- ============================================
CREATE TABLE IF NOT EXISTS site_photos (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    wbs_id CHAR(36),
    daily_report_id CHAR(36),
    photo_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    photo_type ENUM('Progress', 'Before', 'After', 'Issue', 'Inspection', 'Drone', 'Other') DEFAULT 'Progress',
    taken_date DATE,
    location_tag VARCHAR(255),
    uploaded_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs_items(id) ON DELETE SET NULL,
    FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_project_photos (project_id, taken_date)
);
