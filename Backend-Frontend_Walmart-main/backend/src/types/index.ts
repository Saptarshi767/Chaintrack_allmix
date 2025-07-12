import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'supplier' | 'walmart_staff' | 'customer' | 'admin';
  name: string;
  supplier_id?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Electronics' | 'Food' | 'Clothing' | 'Home' | 'Health';
  supplier_id: string;
  blockchain_hash?: string;
  sku: string;
  description?: string;
  price: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  sustainability_score: number;
  carbon_footprint: number;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  contact_email: string;
  contact_phone?: string;
  blockchain_address?: string;
  sustainability_score: number;
  performance_rating: number;
  on_time_delivery: number;
  quality_score: number;
  cost_efficiency: number;
  verified: boolean;
  certification_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  specialties: string[];
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface TrackingEvent {
  id: string;
  product_id: string;
  location: string;
  status: 'created' | 'in_transit' | 'in_warehouse' | 'in_store' | 'delivered' | 'returned';
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  temperature?: number;
  humidity?: number;
  timestamp: Date;
  blockchain_tx_hash?: string;
  scanned_by?: string;
  device_info?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface Inventory {
  id: string;
  product_id: string;
  store_location: string;
  quantity: number;
  reserved_quantity: number;
  reorder_point: number;
  max_stock: number;
  last_restocked: Date;
  expiry_date?: Date;
  batch_number?: string;
  storage_conditions?: {
    temperature_range: [number, number];
    humidity_range: [number, number];
  };
  last_updated: Date;
}

export interface BlockchainTransaction {
  id: string;
  transaction_hash: string;
  block_number: number;
  product_id: string;
  action: 'create' | 'transfer' | 'update' | 'verify';
  from_address: string;
  to_address: string;
  gas_used: number;
  gas_price: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AIPrediction {
  id: string;
  product_id: string;
  store_location?: string;
  prediction_type: 'demand' | 'inventory' | 'price' | 'trend';
  predicted_value: number;
  confidence_score: number;
  factors: string[];
  time_horizon: number; // days
  generated_at: Date;
  valid_until: Date;
  actual_value?: number;
  accuracy?: number;
}

export interface QRScanLog {
  id: string;
  product_id: string;
  scanned_by: string;
  scan_location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  device_info: {
    user_agent: string;
    ip_address: string;
    device_type: 'mobile' | 'tablet' | 'desktop';
  };
  scan_result: 'success' | 'invalid' | 'expired';
  timestamp: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    supplier_id?: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  request_id?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProductFilters extends PaginationQuery {
  category?: string;
  supplier_id?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
}

export interface SupplierFilters extends PaginationQuery {
  location?: string;
  min_sustainability?: number;
  verified?: boolean;
  certification_level?: string;
  search?: string;
}

export interface DashboardStats {
  products_tracked: number;
  active_shipments: number;
  verified_suppliers: number;
  co2_saved: number;
  daily_scans: number;
  blockchain_transactions: number;
  average_delivery_time: number;
  customer_satisfaction: number;
  revenue_impact: number;
  cost_savings: number;
}

export interface SupplyChainMetrics {
  on_time_delivery: number;
  quality_score: number;
  sustainability_score: number;
  cost_efficiency: number;
  carbon_footprint: number;
  supplier_performance: number;
  inventory_turnover: number;
  waste_reduction: number;
}

export interface WebSocketMessage {
  type: 'product_update' | 'tracking_update' | 'prediction_update' | 'alert';
  data: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
}

export interface NotificationAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  product_id?: string;
  supplier_id?: string;
  created_at: Date;
  read_at?: Date;
  expires_at?: Date;
  metadata?: Record<string, unknown>;
}