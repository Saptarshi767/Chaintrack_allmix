import { getMongoDB } from '../config/database.js';
import { logger } from '../config/logger.js';

export const createMongoIndexes = async (): Promise<void> => {
  try {
    const db = getMongoDB();
    
    // Users collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { role: 1 }, name: 'role_index' },
      { key: { supplier_id: 1 }, name: 'supplier_id_index' },
      { key: { created_at: -1 }, name: 'created_at_desc' }
    ]);

    // Suppliers collection indexes
    await db.collection('suppliers').createIndexes([
      { key: { contact_email: 1 }, unique: true, name: 'contact_email_unique' },
      { key: { verified: 1 }, name: 'verified_index' },
      { key: { sustainability_score: -1 }, name: 'sustainability_desc' },
      { key: { certification_level: 1 }, name: 'certification_index' },
      { key: { location: 'text', name: 'text' }, name: 'text_search' }
    ]);

    // Products collection indexes
    await db.collection('products').createIndexes([
      { key: { sku: 1 }, unique: true, name: 'sku_unique' },
      { key: { supplier_id: 1 }, name: 'supplier_id_index' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { is_active: 1 }, name: 'is_active_index' },
      { key: { created_at: -1 }, name: 'created_at_desc' },
      { key: { price: 1 }, name: 'price_index' },
      { key: { sustainability_score: -1 }, name: 'sustainability_desc' },
      { key: { name: 'text', description: 'text' }, name: 'text_search' }
    ]);

    // Tracking events collection indexes
    await db.collection('tracking_events').createIndexes([
      { key: { product_id: 1 }, name: 'product_id_index' },
      { key: { timestamp: -1 }, name: 'timestamp_desc' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { location: 1 }, name: 'location_index' },
      { key: { blockchain_tx_hash: 1 }, name: 'blockchain_hash_index' },
      { key: { product_id: 1, timestamp: -1 }, name: 'product_timeline' }
    ]);

    // Blockchain transactions collection indexes
    await db.collection('blockchain_transactions').createIndexes([
      { key: { transaction_hash: 1 }, unique: true, name: 'tx_hash_unique' },
      { key: { product_id: 1 }, name: 'product_id_index' },
      { key: { timestamp: -1 }, name: 'timestamp_desc' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { action: 1 }, name: 'action_index' },
      { key: { block_number: -1 }, name: 'block_number_desc' }
    ]);

    // QR scan logs collection indexes
    await db.collection('qr_scan_logs').createIndexes([
      { key: { product_id: 1 }, name: 'product_id_index' },
      { key: { timestamp: -1 }, name: 'timestamp_desc' },
      { key: { scanned_by: 1 }, name: 'scanned_by_index' },
      { key: { scan_result: 1 }, name: 'scan_result_index' },
      { key: { scan_location: 1 }, name: 'scan_location_index' }
    ]);

    // Inventory collection indexes
    await db.collection('inventory').createIndexes([
      { key: { product_id: 1, store_location: 1 }, unique: true, name: 'product_store_unique' },
      { key: { store_location: 1 }, name: 'store_location_index' },
      { key: { quantity: 1 }, name: 'quantity_index' },
      { key: { last_updated: -1 }, name: 'last_updated_desc' }
    ]);

    logger.info('MongoDB indexes created successfully');
  } catch (error) {
    logger.error('Failed to create MongoDB indexes:', error);
    throw error;
  }
};

// MongoDB Collection Schemas (for documentation purposes)
export const mongoSchemas = {
  users: {
    _id: 'ObjectId',
    id: 'string', // UUID
    email: 'string',
    password_hash: 'string',
    name: 'string',
    role: 'string', // 'supplier' | 'walmart_staff' | 'customer' | 'admin'
    supplier_id: 'string?', // UUID reference
    created_at: 'Date',
    updated_at: 'Date',
    last_login: 'Date?',
    is_active: 'boolean'
  },

  suppliers: {
    _id: 'ObjectId',
    id: 'string', // UUID
    name: 'string',
    location: 'string',
    contact_email: 'string',
    contact_phone: 'string?',
    blockchain_address: 'string?',
    sustainability_score: 'number',
    performance_rating: 'number',
    on_time_delivery: 'number',
    quality_score: 'number',
    cost_efficiency: 'number',
    verified: 'boolean',
    certification_level: 'string', // 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
    specialties: 'string[]',
    created_at: 'Date',
    updated_at: 'Date',
    is_active: 'boolean'
  },

  products: {
    _id: 'ObjectId',
    id: 'string', // UUID
    name: 'string',
    category: 'string', // 'Electronics' | 'Food' | 'Clothing' | 'Home' | 'Health'
    supplier_id: 'string', // UUID reference
    blockchain_hash: 'string?',
    sku: 'string',
    description: 'string?',
    price: 'number',
    weight: 'number?',
    dimensions: {
      length: 'number',
      width: 'number',
      height: 'number'
    },
    sustainability_score: 'number',
    carbon_footprint: 'number',
    created_at: 'Date',
    updated_at: 'Date',
    is_active: 'boolean'
  },

  tracking_events: {
    _id: 'ObjectId',
    id: 'string', // UUID
    product_id: 'string', // UUID reference
    location: 'string',
    status: 'string', // 'created' | 'in_transit' | 'in_warehouse' | 'in_store' | 'delivered' | 'returned'
    description: 'string',
    coordinates: {
      latitude: 'number',
      longitude: 'number'
    },
    temperature: 'number?',
    humidity: 'number?',
    timestamp: 'Date',
    blockchain_tx_hash: 'string?',
    scanned_by: 'string?', // UUID reference
    device_info: 'object?',
    metadata: 'object?'
  },

  blockchain_transactions: {
    _id: 'ObjectId',
    id: 'string', // UUID
    transaction_hash: 'string',
    block_number: 'number?',
    product_id: 'string', // UUID reference
    action: 'string', // 'create' | 'transfer' | 'update' | 'verify'
    from_address: 'string',
    to_address: 'string',
    gas_used: 'number?',
    gas_price: 'string?',
    status: 'string', // 'pending' | 'confirmed' | 'failed'
    timestamp: 'Date',
    metadata: 'object?'
  },

  qr_scan_logs: {
    _id: 'ObjectId',
    id: 'string', // UUID
    product_id: 'string', // UUID reference
    scanned_by: 'string?', // UUID reference
    scan_location: 'string',
    coordinates: {
      latitude: 'number',
      longitude: 'number'
    },
    device_info: {
      user_agent: 'string',
      ip_address: 'string',
      device_type: 'string' // 'mobile' | 'tablet' | 'desktop'
    },
    scan_result: 'string', // 'success' | 'invalid' | 'expired'
    timestamp: 'Date'
  },

  inventory: {
    _id: 'ObjectId',
    id: 'string', // UUID
    product_id: 'string', // UUID reference
    store_location: 'string',
    quantity: 'number',
    reserved_quantity: 'number',
    reorder_point: 'number',
    max_stock: 'number?',
    last_restocked: 'Date',
    expiry_date: 'Date?',
    batch_number: 'string?',
    storage_conditions: {
      temperature_range: 'number[]', // [min, max]
      humidity_range: 'number[]' // [min, max]
    },
    last_updated: 'Date'
  }
};