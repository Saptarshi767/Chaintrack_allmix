-- ChainTrack Database Schema
-- PostgreSQL Database Setup

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('supplier', 'walmart_staff', 'customer', 'admin')),
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT fk_user_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    blockchain_address VARCHAR(255),
    sustainability_score DECIMAL(3,2) DEFAULT 0.00 CHECK (sustainability_score >= 0 AND sustainability_score <= 10),
    performance_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (performance_rating >= 0 AND performance_rating <= 5),
    on_time_delivery DECIMAL(5,2) DEFAULT 0.00 CHECK (on_time_delivery >= 0 AND on_time_delivery <= 100),
    quality_score DECIMAL(3,2) DEFAULT 0.00 CHECK (quality_score >= 0 AND quality_score <= 5),
    cost_efficiency DECIMAL(5,2) DEFAULT 0.00 CHECK (cost_efficiency >= 0 AND cost_efficiency <= 100),
    verified BOOLEAN DEFAULT false,
    certification_level VARCHAR(50) DEFAULT 'Bronze' CHECK (certification_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    specialties JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Electronics', 'Food', 'Clothing', 'Home', 'Health')),
    supplier_id UUID NOT NULL,
    blockchain_hash VARCHAR(255),
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    weight DECIMAL(10,3) CHECK (weight >= 0),
    dimensions JSONB, -- {length, width, height}
    sustainability_score DECIMAL(3,2) DEFAULT 0.00 CHECK (sustainability_score >= 0 AND sustainability_score <= 10),
    carbon_footprint DECIMAL(10,3) DEFAULT 0.000 CHECK (carbon_footprint >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT fk_product_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- Tracking events table
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    location VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('created', 'in_transit', 'in_warehouse', 'in_store', 'delivered', 'returned')),
    description TEXT NOT NULL,
    coordinates JSONB, -- {latitude, longitude}
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2) CHECK (humidity >= 0 AND humidity <= 100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blockchain_tx_hash VARCHAR(255),
    scanned_by UUID,
    device_info JSONB,
    metadata JSONB,
    CONSTRAINT fk_tracking_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_tracking_user FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    store_location VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
    reorder_point INTEGER DEFAULT 0 CHECK (reorder_point >= 0),
    max_stock INTEGER CHECK (max_stock >= 0),
    last_restocked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    batch_number VARCHAR(100),
    storage_conditions JSONB, -- {temperature_range: [min, max], humidity_range: [min, max]}
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_store UNIQUE (product_id, store_location)
);

-- Blockchain transactions table
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    block_number BIGINT,
    product_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'transfer', 'update', 'verify')),
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    gas_used BIGINT,
    gas_price VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    CONSTRAINT fk_blockchain_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- AI predictions table
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    store_location VARCHAR(255),
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('demand', 'inventory', 'price', 'trend')),
    predicted_value DECIMAL(15,4) NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    factors JSONB NOT NULL DEFAULT '[]',
    time_horizon INTEGER NOT NULL CHECK (time_horizon > 0), -- days
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_value DECIMAL(15,4),
    accuracy DECIMAL(5,4) CHECK (accuracy >= 0 AND accuracy <= 1),
    CONSTRAINT fk_prediction_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- QR scan logs table
CREATE TABLE qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    scanned_by UUID,
    scan_location VARCHAR(500) NOT NULL,
    coordinates JSONB, -- {latitude, longitude}
    device_info JSONB NOT NULL, -- {user_agent, ip_address, device_type}
    scan_result VARCHAR(20) NOT NULL CHECK (scan_result IN ('success', 'invalid', 'expired')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_scan_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_scan_user FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notification alerts table
CREATE TABLE notification_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    product_id UUID,
    supplier_id UUID,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    CONSTRAINT fk_alert_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE INDEX idx_tracking_events_product_id ON tracking_events(product_id);
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(timestamp);
CREATE INDEX idx_tracking_events_status ON tracking_events(status);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_store_location ON inventory(store_location);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

CREATE INDEX idx_blockchain_tx_product_id ON blockchain_transactions(product_id);
CREATE INDEX idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX idx_blockchain_tx_timestamp ON blockchain_transactions(timestamp);

CREATE INDEX idx_ai_predictions_product_id ON ai_predictions(product_id);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(prediction_type);
CREATE INDEX idx_ai_predictions_generated_at ON ai_predictions(generated_at);

CREATE INDEX idx_qr_scans_product_id ON qr_scan_logs(product_id);
CREATE INDEX idx_qr_scans_timestamp ON qr_scan_logs(timestamp);
CREATE INDEX idx_qr_scans_result ON qr_scan_logs(scan_result);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_supplier_id ON users(supplier_id);

CREATE INDEX idx_suppliers_verified ON suppliers(verified);
CREATE INDEX idx_suppliers_certification ON suppliers(certification_level);
CREATE INDEX idx_suppliers_sustainability ON suppliers(sustainability_score);

CREATE INDEX idx_alerts_user_id ON notification_alerts(user_id);
CREATE INDEX idx_alerts_created_at ON notification_alerts(created_at);
CREATE INDEX idx_alerts_read_at ON notification_alerts(read_at);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW product_details AS
SELECT 
    p.*,
    s.name as supplier_name,
    s.location as supplier_location,
    s.sustainability_score as supplier_sustainability,
    s.verified as supplier_verified,
    (SELECT COUNT(*) FROM tracking_events te WHERE te.product_id = p.id) as tracking_events_count,
    (SELECT status FROM tracking_events te WHERE te.product_id = p.id ORDER BY timestamp DESC LIMIT 1) as current_status,
    (SELECT location FROM tracking_events te WHERE te.product_id = p.id ORDER BY timestamp DESC LIMIT 1) as current_location
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.is_active = true;

CREATE VIEW supplier_performance AS
SELECT 
    s.*,
    COUNT(p.id) as total_products,
    AVG(p.sustainability_score) as avg_product_sustainability,
    COUNT(CASE WHEN p.is_active THEN 1 END) as active_products,
    (SELECT COUNT(*) FROM users u WHERE u.supplier_id = s.id AND u.is_active = true) as user_count
FROM suppliers s
LEFT JOIN products p ON s.id = p.supplier_id
WHERE s.is_active = true
GROUP BY s.id;

CREATE VIEW inventory_summary AS
SELECT 
    i.*,
    p.name as product_name,
    p.category as product_category,
    p.price as product_price,
    s.name as supplier_name,
    (i.quantity * p.price) as inventory_value,
    CASE 
        WHEN i.quantity <= i.reorder_point THEN 'low_stock'
        WHEN i.quantity >= i.max_stock THEN 'overstock'
        ELSE 'normal'
    END as stock_status
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE p.is_active = true;

-- Sample data insertion (commented out - use seed.ts instead)
/*
-- Insert sample suppliers
INSERT INTO suppliers (name, location, contact_email, sustainability_score, verified, certification_level) VALUES
('Apple Inc.', 'Cupertino, CA, USA', 'supply@apple.com', 8.5, true, 'Platinum'),
('FreshFarm Co.', 'Quito, Ecuador', 'export@freshfarm.ec', 9.2, true, 'Gold'),
('Nike Manufacturing', 'Ho Chi Minh City, Vietnam', 'supply@nike.com', 7.8, true, 'Silver'),
('Samsung Electronics', 'Seoul, South Korea', 'b2b@samsung.com', 8.1, true, 'Gold'),
('GreenGrow Organics', 'Michoacán, Mexico', 'orders@greengrow.mx', 9.5, true, 'Platinum');
*/