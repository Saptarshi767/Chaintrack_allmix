export interface Product {
  id: string;
  name: string;
  category: 'Electronics' | 'Food' | 'Clothing' | 'Home' | 'Health';
  currentLocation: string;
  status: 'In Stock' | 'In Transit' | 'Delivered' | 'Processing' | 'On Shelf';
  sustainability: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
  image: string;
  batchId: string;
  supplierId: string;
  journey: JourneyStep[];
  temperature?: number;
  humidity?: number;
  lastUpdated: string;
  price: number;
  co2Saved: number;
}

export interface JourneyStep {
  id: string;
  location: string;
  timestamp: string;
  status: string;
  description: string;
  coordinates: [number, number];
  temperature?: number;
  humidity?: number;
  blockchainHash?: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  performance: number;
  sustainability: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
  products: string[];
  onTimeDelivery: number;
  qualityScore: number;
  costEfficiency: number;
  verified: boolean;
  joinDate: string;
  contact: {
    email: string;
    phone: string;
  };
}

export interface Transaction {
  id: string;
  hash: string;
  action: 'Product Created' | 'Location Updated' | 'Ownership Transfer' | 'Quality Check' | 'Delivered';
  timestamp: string;
  gasUsed: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
  productId: string;
  from: string;
  to: string;
}

export interface Prediction {
  id: string;
  productId: string;
  productName: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  recommendation: string;
  impact: string;
  created: string;
}

// Sample Products Data
export const sampleProducts: Product[] = [
  {
    id: 'P001',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    currentLocation: 'Best Buy Store #1234',
    status: 'In Stock',
    sustainability: 'A+',
    image: '📱',
    batchId: 'APL-2024-001',
    supplierId: 'S001',
    price: 999.99,
    co2Saved: 15.2,
    lastUpdated: '2024-01-15T10:30:00Z',
    journey: [
      {
        id: 'J001',
        location: 'Apple Factory, China',
        timestamp: '2024-01-10T08:00:00Z',
        status: 'Manufacturing Complete',
        description: 'Product manufactured and quality tested',
        coordinates: [39.9042, 116.4074],
        blockchainHash: '0x7d5a8b9c3e2f1a4d6e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
      },
      {
        id: 'J002',
        location: 'Shanghai Port, China',
        timestamp: '2024-01-11T14:20:00Z',
        status: 'Export Processing',
        description: 'Customs clearance and export documentation',
        coordinates: [31.2304, 121.4737],
        blockchainHash: '0x8e6f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
      },
      {
        id: 'J003',
        location: 'Los Angeles Port, USA',
        timestamp: '2024-01-12T09:45:00Z',
        status: 'Import Received',
        description: 'Arrived at US port, customs processing',
        coordinates: [33.7377, -118.2647],
        blockchainHash: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a'
      },
      {
        id: 'J004',
        location: 'Distribution Center, Dallas',
        timestamp: '2024-01-13T16:15:00Z',
        status: 'In Distribution',
        description: 'Sorted and prepared for retail distribution',
        coordinates: [32.7767, -96.7970],
        blockchainHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
      },
      {
        id: 'J005',
        location: 'Best Buy Store #1234',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'In Stock',
        description: 'Available for customer purchase',
        coordinates: [40.7128, -74.0060],
        blockchainHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
      }
    ]
  },
  {
    id: 'P002',
    name: 'Organic Bananas',
    category: 'Food',
    currentLocation: 'Walmart Store #5678',
    status: 'On Shelf',
    sustainability: 'A+',
    image: '🍌',
    batchId: 'ORG-BAN-2024-045',
    supplierId: 'S002',
    price: 2.99,
    co2Saved: 3.8,
    temperature: 58,
    humidity: 85,
    lastUpdated: '2024-01-15T08:15:00Z',
    journey: [
      {
        id: 'J006',
        location: 'FreshFarm Co., Ecuador',
        timestamp: '2024-01-08T06:00:00Z',
        status: 'Harvested',
        description: 'Organic bananas harvested at peak ripeness',
        coordinates: [-0.1807, -78.4678],
        temperature: 75,
        humidity: 90,
        blockchainHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'
      },
      {
        id: 'J007',
        location: 'Processing Facility, Ecuador',
        timestamp: '2024-01-09T10:30:00Z',
        status: 'Packaged',
        description: 'Cleaned, sorted, and packaged for export',
        coordinates: [-0.1807, -78.4678],
        temperature: 60,
        humidity: 80,
        blockchainHash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5'
      },
      {
        id: 'J008',
        location: 'Miami Import Center',
        timestamp: '2024-01-12T14:20:00Z',
        status: 'Quality Inspection',
        description: 'USDA quality and safety inspection completed',
        coordinates: [25.7617, -80.1918],
        temperature: 55,
        humidity: 75,
        blockchainHash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6'
      },
      {
        id: 'J009',
        location: 'Walmart Store #5678',
        timestamp: '2024-01-15T08:15:00Z',
        status: 'On Shelf',
        description: 'Available for customer purchase',
        coordinates: [29.7604, -95.3698],
        temperature: 58,
        humidity: 85,
        blockchainHash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7'
      }
    ]
  },
  {
    id: 'P003',
    name: 'Nike Air Max 270',
    category: 'Clothing',
    currentLocation: 'Delivery Truck #456',
    status: 'In Transit',
    sustainability: 'B+',
    image: '👟',
    batchId: 'NIKE-AM270-2024-123',
    supplierId: 'S003',
    price: 149.99,
    co2Saved: 8.7,
    lastUpdated: '2024-01-15T12:45:00Z',
    journey: [
      {
        id: 'J010',
        location: 'Nike Factory, Vietnam',
        timestamp: '2024-01-05T09:00:00Z',
        status: 'Manufacturing',
        description: 'Sustainable manufacturing process completed',
        coordinates: [21.0285, 105.8542],
        blockchainHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'
      },
      {
        id: 'J011',
        location: 'Distribution Center, Oregon',
        timestamp: '2024-01-12T11:30:00Z',
        status: 'Received',
        description: 'Quality inspection and inventory processing',
        coordinates: [45.5152, -122.6784],
        blockchainHash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9'
      },
      {
        id: 'J012',
        location: 'Delivery Truck #456',
        timestamp: '2024-01-15T12:45:00Z',
        status: 'In Transit',
        description: 'En route to customer delivery address',
        coordinates: [39.7392, -104.9903],
        blockchainHash: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0'
      }
    ]
  },
  {
    id: 'P004',
    name: 'Samsung 4K Smart TV',
    category: 'Electronics',
    currentLocation: 'Costco Warehouse #789',
    status: 'In Stock',
    sustainability: 'A',
    image: '📺',
    batchId: 'SAM-TV-2024-089',
    supplierId: 'S004',
    price: 799.99,
    co2Saved: 22.4,
    lastUpdated: '2024-01-15T09:20:00Z',
    journey: [
      {
        id: 'J013',
        location: 'Samsung Factory, South Korea',
        timestamp: '2024-01-01T10:00:00Z',
        status: 'Manufacturing',
        description: 'Energy-efficient manufacturing process',
        coordinates: [37.5665, 126.9780],
        blockchainHash: '0xd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1'
      },
      {
        id: 'J014',
        location: 'Costco Warehouse #789',
        timestamp: '2024-01-15T09:20:00Z',
        status: 'In Stock',
        description: 'Ready for member purchase',
        coordinates: [47.6062, -122.3321],
        blockchainHash: '0xe1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2'
      }
    ]
  },
  {
    id: 'P005',
    name: 'Organic Avocados',
    category: 'Food',
    currentLocation: 'Whole Foods #321',
    status: 'On Shelf',
    sustainability: 'A+',
    image: '🥑',
    batchId: 'ORG-AVO-2024-067',
    supplierId: 'S005',
    price: 6.99,
    co2Saved: 4.2,
    temperature: 45,
    humidity: 90,
    lastUpdated: '2024-01-15T07:45:00Z',
    journey: [
      {
        id: 'J015',
        location: 'Organic Farm, Mexico',
        timestamp: '2024-01-10T05:30:00Z',
        status: 'Harvested',
        description: 'Hand-picked at optimal ripeness',
        coordinates: [19.4326, -99.1332],
        temperature: 78,
        humidity: 85,
        blockchainHash: '0xf2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3'
      },
      {
        id: 'J016',
        location: 'Whole Foods #321',
        timestamp: '2024-01-15T07:45:00Z',
        status: 'On Shelf',
        description: 'Available for customer purchase',
        coordinates: [40.7831, -73.9712],
        temperature: 45,
        humidity: 90,
        blockchainHash: '0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4'
      }
    ]
  }
];

// Sample Suppliers Data
export const sampleSuppliers: Supplier[] = [
  {
    id: 'S001',
    name: 'Apple Inc.',
    location: 'Cupertino, CA, USA',
    performance: 96,
    sustainability: 'A+',
    products: ['Electronics', 'Accessories'],
    onTimeDelivery: 98,
    qualityScore: 4.9,
    costEfficiency: 89,
    verified: true,
    joinDate: '2020-01-15',
    contact: {
      email: 'supply@apple.com',
      phone: '+1-408-996-1010'
    }
  },
  {
    id: 'S002',
    name: 'FreshFarm Co.',
    location: 'Quito, Ecuador',
    performance: 94,
    sustainability: 'A+',
    products: ['Fresh Produce', 'Organic Foods'],
    onTimeDelivery: 92,
    qualityScore: 4.8,
    costEfficiency: 91,
    verified: true,
    joinDate: '2019-06-20',
    contact: {
      email: 'export@freshfarm.ec',
      phone: '+593-2-234-5678'
    }
  },
  {
    id: 'S003',
    name: 'Nike Manufacturing',
    location: 'Ho Chi Minh City, Vietnam',
    performance: 89,
    sustainability: 'B+',
    products: ['Footwear', 'Apparel'],
    onTimeDelivery: 87,
    qualityScore: 4.6,
    costEfficiency: 85,
    verified: true,
    joinDate: '2018-03-10',
    contact: {
      email: 'supply@nike.com',
      phone: '+84-28-3456-7890'
    }
  },
  {
    id: 'S004',
    name: 'Samsung Electronics',
    location: 'Seoul, South Korea',
    performance: 95,
    sustainability: 'A',
    products: ['Electronics', 'Appliances'],
    onTimeDelivery: 94,
    qualityScore: 4.7,
    costEfficiency: 88,
    verified: true,
    joinDate: '2017-11-25',
    contact: {
      email: 'b2b@samsung.com',
      phone: '+82-2-2255-0114'
    }
  },
  {
    id: 'S005',
    name: 'GreenGrow Organics',
    location: 'Michoacán, Mexico',
    performance: 92,
    sustainability: 'A+',
    products: ['Organic Produce', 'Sustainable Foods'],
    onTimeDelivery: 90,
    qualityScore: 4.9,
    costEfficiency: 93,
    verified: true,
    joinDate: '2020-08-12',
    contact: {
      email: 'orders@greengrow.mx',
      phone: '+52-443-123-4567'
    }
  }
];

// Sample Transactions Data
export const sampleTransactions: Transaction[] = [
  {
    id: 'T001',
    hash: '0x7d5a8b9c3e2f1a4d6e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    action: 'Product Created',
    timestamp: '2024-01-15T10:30:00Z',
    gasUsed: '0.0023 ETH',
    status: 'Confirmed',
    productId: 'P001',
    from: 'Apple Factory',
    to: 'Blockchain Network'
  },
  {
    id: 'T002',
    hash: '0x8e6f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    action: 'Location Updated',
    timestamp: '2024-01-15T09:45:00Z',
    gasUsed: '0.0018 ETH',
    status: 'Confirmed',
    productId: 'P002',
    from: 'Miami Import Center',
    to: 'Walmart Store #5678'
  },
  {
    id: 'T003',
    hash: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    action: 'Quality Check',
    timestamp: '2024-01-15T08:20:00Z',
    gasUsed: '0.0015 ETH',
    status: 'Confirmed',
    productId: 'P003',
    from: 'Nike Factory',
    to: 'Quality Assurance'
  },
  {
    id: 'T004',
    hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    action: 'Ownership Transfer',
    timestamp: '2024-01-15T07:15:00Z',
    gasUsed: '0.0021 ETH',
    status: 'Confirmed',
    productId: 'P004',
    from: 'Samsung',
    to: 'Costco Warehouse #789'
  },
  {
    id: 'T005',
    hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    action: 'Delivered',
    timestamp: '2024-01-15T06:30:00Z',
    gasUsed: '0.0019 ETH',
    status: 'Confirmed',
    productId: 'P005',
    from: 'Distribution Center',
    to: 'Whole Foods #321'
  }
];

// Sample Predictions Data
export const samplePredictions: Prediction[] = [
  {
    id: 'PR001',
    productId: 'P001',
    productName: 'iPhone 15 Pro',
    prediction: 'High demand predicted for next 2 weeks',
    confidence: 94,
    timeframe: '2 weeks',
    recommendation: 'Increase inventory by 40%',
    impact: 'Potential revenue increase of $2.3M',
    created: '2024-01-15T10:00:00Z'
  },
  {
    id: 'PR002',
    productId: 'P002',
    productName: 'Organic Bananas',
    prediction: 'Seasonal demand spike expected',
    confidence: 87,
    timeframe: '1 week',
    recommendation: 'Expedite shipments from Ecuador',
    impact: 'Avoid potential stockout',
    created: '2024-01-15T09:30:00Z'
  },
  {
    id: 'PR003',
    productId: 'P003',
    productName: 'Nike Air Max 270',
    prediction: 'Back-to-school demand increase',
    confidence: 91,
    timeframe: '3 weeks',
    recommendation: 'Prepare additional inventory',
    impact: 'Meet 15% demand increase',
    created: '2024-01-15T08:45:00Z'
  }
];

// Statistics Data
export const statistics = {
  productsTracked: 847392,
  activeShipments: 12487,
  verifiedSuppliers: 2341,
  co2Saved: 45231,
  dailyScans: 15692,
  blockchainTransactions: 892456,
  averageDeliveryTime: 3.2,
  customerSatisfaction: 4.7
};

// Recent Scans Data
export const recentScans = [
  {
    id: 'SC001',
    productName: 'iPhone 15 Pro',
    location: 'New York, NY',
    timestamp: '2 minutes ago',
    status: 'Verified',
    user: 'John Smith'
  },
  {
    id: 'SC002',
    productName: 'Organic Bananas',
    location: 'Houston, TX',
    timestamp: '5 minutes ago',
    status: 'Verified',
    user: 'Sarah Johnson'
  },
  {
    id: 'SC003',
    productName: 'Nike Air Max 270',
    location: 'Denver, CO',
    timestamp: '8 minutes ago',
    status: 'In Transit',
    user: 'Mike Brown'
  },
  {
    id: 'SC004',
    productName: 'Samsung 4K TV',
    location: 'Seattle, WA',
    timestamp: '12 minutes ago',
    status: 'Verified',
    user: 'Emily Davis'
  },
  {
    id: 'SC005',
    productName: 'Organic Avocados',
    location: 'Phoenix, AZ',
    timestamp: '15 minutes ago',
    status: 'Verified',
    user: 'Chris Wilson'
  }
];