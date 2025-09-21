-- ==============================
-- DATABASE INITIALIZATION
-- ==============================
CREATE DATABASE IF NOT EXISTS tv_database;
USE tv_database;

-- ==============================
-- ACCOUNTS TABLE (Unified for All Roles)
-- ==============================
CREATE TABLE IF NOT EXISTS accounts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','worker','admin') NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00, -- relevant only for customers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_role ON accounts(role);

-- ==============================
-- RECHARGES TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS recharges (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','verified','rejected') DEFAULT 'pending',
    verified_by_worker INT UNSIGNED,
    verified_by_admin INT UNSIGNED,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_recharges_customer FOREIGN KEY (customer_id) 
        REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_recharges_worker FOREIGN KEY (verified_by_worker) 
        REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_recharges_admin FOREIGN KEY (verified_by_admin) 
        REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_recharges_status ON recharges(status);

-- ==============================
-- COLLECTIONS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS collections (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    worker_id INT UNSIGNED,
    customer_id INT UNSIGNED,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','verified','rejected') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_collections_worker FOREIGN KEY (worker_id) 
        REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_collections_customer FOREIGN KEY (customer_id) 
        REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_collections_status ON collections(status);

-- ==============================
-- PAYMENTS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status ENUM('pending','verified','rejected') DEFAULT 'pending',
    verified_by_admin_id INT UNSIGNED,
    collection_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) 
        REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_admin FOREIGN KEY (verified_by_admin_id) 
        REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_payments_collection FOREIGN KEY (collection_id) 
        REFERENCES collections(id) ON DELETE SET NULL
);

CREATE INDEX idx_payments_status ON payments(status);

-- ==============================
-- NOTIFICATIONS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id INT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_account FOREIGN KEY (account_id) 
        REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ==============================
-- AUDIT LOGS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INT UNSIGNED,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) 
        REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_admin ON audit_logs(admin_id);

-- ==============================
-- ADMIN USERS TABLE (For Admin Panel)
-- ==============================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================
-- ADMIN AUDIT LOGS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INT UNSIGNED,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin_audit_admin FOREIGN KEY (admin_id) 
        REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_audit_admin ON admin_audit_logs(admin_id);
