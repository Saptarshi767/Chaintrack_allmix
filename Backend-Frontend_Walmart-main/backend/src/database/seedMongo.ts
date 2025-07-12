import { connectMongoDB, getMongoDB } from '../config/database.js';
import { createMongoIndexes } from './mongoSchema.js';
import { logger } from '../config/logger.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting MongoDB database seeding...');

    // Connect to MongoDB and create indexes
    await connectMongoDB();
    await createMongoIndexes();

    // Seed suppliers
    const supplierIds = await seedSuppliers();
    
    // Seed users
    await seedUsers(supplierIds);
    
    // Seed products
    const productIds = await seedProducts(supplierIds);
    
    // Seed tracking events
    await seedTrackingEvents(productIds);
    
    // Seed inventory
    await seedInventory(productIds);
    
    // Seed blockchain transactions
    await seedBlockchainTransactions(productIds);
    
    // Seed QR scan logs
    await seedQRScanLogs(productIds);

    logger.info('MongoDB database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

const seedSuppliers = async (): Promise<string[]> => {
  const db = getMongoDB();
  const suppliers = [
    {
      id: uuidv4(),
      name: 'Apple Inc.',
      location: 'Cupertino, CA, USA',
      contact_email: 'supply@apple.com',
      contact_phone: '+1-408-996-1010',
      sustainability_score: 8.5,
      performance_rating: 4.8,
      on_time_delivery: 98.0,
      quality_score: 4.9,
      cost_efficiency: 89.0,
      verified: true,
      certification_level: 'Platinum',
      specialties: ['Electronics', 'Consumer Technology'],
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'FreshFarm Co.',
      location: 'Quito, Ecuador',
      contact_email: 'export@freshfarm.ec',
      contact_phone: '+593-2-234-5678',
      sustainability_score: 9.2,
      performance_rating: 4.7,
      on_time_delivery: 92.0,
      quality_score: 4.8,
      cost_efficiency: 91.0,
      verified: true,
      certification_level: 'Gold',
      specialties: ['Organic Produce', 'Fresh Fruits'],
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Nike Manufacturing',
      location: 'Ho Chi Minh City, Vietnam',
      contact_email: 'supply@nike.com',
      contact_phone: '+84-28-3456-7890',
      sustainability_score: 7.8,
      performance_rating: 4.6,
      on_time_delivery: 87.0,
      quality_score: 4.6,
      cost_efficiency: 85.0,
      verified: true,
      certification_level: 'Silver',
      specialties: ['Footwear', 'Apparel', 'Sports Equipment'],
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Samsung Electronics',
      location: 'Seoul, South Korea',
      contact_email: 'b2b@samsung.com',
      contact_phone: '+82-2-2255-0114',
      sustainability_score: 8.1,
      performance_rating: 4.7,
      on_time_delivery: 94.0,
      quality_score: 4.7,
      cost_efficiency: 88.0,
      verified: true,
      certification_level: 'Gold',
      specialties: ['Electronics', 'Displays', 'Semiconductors'],
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'GreenGrow Organics',
      location: 'Michoacán, Mexico',
      contact_email: 'orders@greengrow.mx',
      contact_phone: '+52-443-123-4567',
      sustainability_score: 9.5,
      performance_rating: 4.9,
      on_time_delivery: 90.0,
      quality_score: 4.9,
      cost_efficiency: 93.0,
      verified: true,
      certification_level: 'Platinum',
      specialties: ['Organic Produce', 'Sustainable Agriculture'],
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    }
  ];

  // Clear existing suppliers
  await db.collection('suppliers').deleteMany({});
  
  // Insert new suppliers
  await db.collection('suppliers').insertMany(suppliers);

  logger.info(`Seeded ${suppliers.length} suppliers`);
  return suppliers.map(s => s.id);
};

const seedUsers = async (supplierIds: string[]): Promise<void> => {
  const db = getMongoDB();
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = [
    {
      id: uuidv4(),
      email: 'admin@walmart.com',
      password_hash: passwordHash,
      name: 'System Administrator',
      role: 'admin',
      supplier_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
      is_active: true
    },
    {
      id: uuidv4(),
      email: 'manager@walmart.com',
      password_hash: passwordHash,
      name: 'Supply Chain Manager',
      role: 'walmart_staff',
      supplier_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
      is_active: true
    },
    {
      id: uuidv4(),
      email: 'supplier@apple.com',
      password_hash: passwordHash,
      name: 'Apple Supply Manager',
      role: 'supplier',
      supplier_id: supplierIds[0],
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
      is_active: true
    },
    {
      id: uuidv4(),
      email: 'customer@example.com',
      password_hash: passwordHash,
      name: 'John Customer',
      role: 'customer',
      supplier_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
      is_active: true
    }
  ];

  // Clear existing users
  await db.collection('users').deleteMany({});
  
  // Insert new users
  await db.collection('users').insertMany(users);

  logger.info(`Seeded ${users.length} users`);
};

const seedProducts = async (supplierIds: string[]): Promise<string[]> => {
  const db = getMongoDB();
  const products = [
    {
      id: uuidv4(),
      name: 'iPhone 15 Pro',
      category: 'Electronics',
      supplier_id: supplierIds[0], // Apple
      sku: 'APL-IP15P-001',
      description: 'Latest iPhone with Pro features',
      price: 999.99,
      weight: 0.221,
      dimensions: { length: 159.9, width: 76.7, height: 8.25 },
      sustainability_score: 8.2,
      carbon_footprint: 65.5,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Organic Bananas',
      category: 'Food',
      supplier_id: supplierIds[1], // FreshFarm
      sku: 'ORG-BAN-001',
      description: 'Premium organic bananas from Ecuador',
      price: 2.99,
      weight: 1.0,
      sustainability_score: 9.1,
      carbon_footprint: 0.8,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Nike Air Max 270',
      category: 'Clothing',
      supplier_id: supplierIds[2], // Nike
      sku: 'NIKE-AM270-001',
      description: 'Comfortable running shoes',
      price: 149.99,
      weight: 0.85,
      dimensions: { length: 32.0, width: 12.0, height: 11.0 },
      sustainability_score: 7.3,
      carbon_footprint: 12.4,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Samsung 4K Smart TV 55"',
      category: 'Electronics',
      supplier_id: supplierIds[3], // Samsung
      sku: 'SAM-TV55-001',
      description: '55-inch 4K Ultra HD Smart TV',
      price: 799.99,
      weight: 18.5,
      dimensions: { length: 123.0, width: 71.0, height: 8.0 },
      sustainability_score: 7.9,
      carbon_footprint: 145.2,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Organic Avocados',
      category: 'Food',
      supplier_id: supplierIds[4], // GreenGrow
      sku: 'ORG-AVO-001',
      description: 'Fresh organic avocados from Mexico',
      price: 6.99,
      weight: 0.6,
      sustainability_score: 9.3,
      carbon_footprint: 1.2,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    }
  ];

  // Clear existing products
  await db.collection('products').deleteMany({});
  
  // Insert new products
  await db.collection('products').insertMany(products);

  logger.info(`Seeded ${products.length} products`);
  return products.map(p => p.id);
};

const seedTrackingEvents = async (productIds: string[]): Promise<void> => {
  const db = getMongoDB();
  const events = [
    {
      id: uuidv4(),
      product_id: productIds[0],
      location: 'Apple Factory, China',
      status: 'created',
      description: 'Product manufactured and quality tested',
      coordinates: { latitude: 39.9042, longitude: 116.4074 },
      timestamp: new Date(),
      blockchain_tx_hash: '0x7d5a8b9c3e2f1a4d6e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
    },
    {
      id: uuidv4(),
      product_id: productIds[0],
      location: 'Best Buy Store #1234',
      status: 'in_store',
      description: 'Available for customer purchase',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      timestamp: new Date(),
      blockchain_tx_hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
    },
    {
      id: uuidv4(),
      product_id: productIds[1],
      location: 'FreshFarm Co., Ecuador',
      status: 'created',
      description: 'Organic bananas harvested at peak ripeness',
      coordinates: { latitude: -0.1807, longitude: -78.4678 },
      temperature: 75,
      humidity: 90,
      timestamp: new Date(),
      blockchain_tx_hash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'
    },
    {
      id: uuidv4(),
      product_id: productIds[1],
      location: 'Walmart Store #5678',
      status: 'in_store',
      description: 'Available for customer purchase',
      coordinates: { latitude: 29.7604, longitude: -95.3698 },
      temperature: 58,
      humidity: 85,
      timestamp: new Date(),
      blockchain_tx_hash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7'
    }
  ];

  // Clear existing tracking events
  await db.collection('tracking_events').deleteMany({});
  
  // Insert new tracking events
  await db.collection('tracking_events').insertMany(events);

  logger.info(`Seeded ${events.length} tracking events`);
};

const seedInventory = async (productIds: string[]): Promise<void> => {
  const db = getMongoDB();
  const inventory = [
    {
      id: uuidv4(),
      product_id: productIds[0],
      store_location: 'Best Buy Store #1234',
      quantity: 25,
      reserved_quantity: 0,
      reorder_point: 5,
      max_stock: 50,
      last_restocked: new Date(),
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      product_id: productIds[1],
      store_location: 'Walmart Store #5678',
      quantity: 150,
      reserved_quantity: 0,
      reorder_point: 20,
      max_stock: 200,
      last_restocked: new Date(),
      last_updated: new Date()
    },
    {
      id: uuidv4(),
      product_id: productIds[2],
      store_location: 'Nike Store #999',
      quantity: 35,
      reserved_quantity: 0,
      reorder_point: 10,
      max_stock: 75,
      last_restocked: new Date(),
      last_updated: new Date()
    }
  ];

  // Clear existing inventory
  await db.collection('inventory').deleteMany({});
  
  // Insert new inventory
  await db.collection('inventory').insertMany(inventory);

  logger.info(`Seeded ${inventory.length} inventory records`);
};

const seedBlockchainTransactions = async (productIds: string[]): Promise<void> => {
  const db = getMongoDB();
  const transactions = [
    {
      id: uuidv4(),
      transaction_hash: '0x7d5a8b9c3e2f1a4d6e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      block_number: 18500000,
      product_id: productIds[0],
      action: 'create',
      from_address: '0x0000000000000000000000000000000000000000',
      to_address: '0x1234567890123456789012345678901234567890',
      gas_used: 21000,
      gas_price: '20000000000',
      status: 'confirmed',
      timestamp: new Date()
    },
    {
      id: uuidv4(),
      transaction_hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      block_number: 18500001,
      product_id: productIds[0],
      action: 'transfer',
      from_address: '0x1234567890123456789012345678901234567890',
      to_address: '0x2345678901234567890123456789012345678901',
      gas_used: 25000,
      gas_price: '20000000000',
      status: 'confirmed',
      timestamp: new Date()
    },
    {
      id: uuidv4(),
      transaction_hash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      block_number: 18500002,
      product_id: productIds[1],
      action: 'create',
      from_address: '0x0000000000000000000000000000000000000000',
      to_address: '0x3456789012345678901234567890123456789012',
      gas_used: 21000,
      gas_price: '20000000000',
      status: 'confirmed',
      timestamp: new Date()
    }
  ];

  // Clear existing blockchain transactions
  await db.collection('blockchain_transactions').deleteMany({});
  
  // Insert new blockchain transactions
  await db.collection('blockchain_transactions').insertMany(transactions);

  logger.info(`Seeded ${transactions.length} blockchain transactions`);
};

const seedQRScanLogs = async (productIds: string[]): Promise<void> => {
  const db = getMongoDB();
  const scanLogs = [
    {
      id: uuidv4(),
      product_id: productIds[0],
      scanned_by: null, // Anonymous scan
      scan_location: 'New York, NY',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      device_info: {
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        ip_address: '192.168.1.100',
        device_type: 'mobile'
      },
      scan_result: 'success',
      timestamp: new Date()
    },
    {
      id: uuidv4(),
      product_id: productIds[1],
      scanned_by: null, // Anonymous scan
      scan_location: 'Houston, TX',
      coordinates: { latitude: 29.7604, longitude: -95.3698 },
      device_info: {
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip_address: '192.168.1.101',
        device_type: 'desktop'
      },
      scan_result: 'success',
      timestamp: new Date()
    },
    {
      id: uuidv4(),
      product_id: productIds[2],
      scanned_by: null, // Anonymous scan
      scan_location: 'Denver, CO',
      coordinates: { latitude: 39.7392, longitude: -104.9903 },
      device_info: {
        user_agent: 'Mozilla/5.0 (Android 11; Mobile)',
        ip_address: '192.168.1.102',
        device_type: 'mobile'
      },
      scan_result: 'success',
      timestamp: new Date()
    }
  ];

  // Clear existing QR scan logs
  await db.collection('qr_scan_logs').deleteMany({});
  
  // Insert new QR scan logs
  await db.collection('qr_scan_logs').insertMany(scanLogs);

  logger.info(`Seeded ${scanLogs.length} QR scan logs`);
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}