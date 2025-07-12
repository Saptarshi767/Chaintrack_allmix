import { Router, Response } from 'express';
import { getMongoDB } from '../config/database.js';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, ApiResponse, DashboardStats, SupplyChainMetrics } from '../types/index.js';

const router = Router();

// Get dashboard statistics
router.get('/dashboard', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const dashboardQuery = `
    WITH product_stats AS (
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_active THEN 1 END) as active_products,
        AVG(sustainability_score) as avg_sustainability,
        SUM(carbon_footprint) as total_carbon_footprint
      FROM products
    ),
    supplier_stats AS (
      SELECT 
        COUNT(*) as total_suppliers,
        COUNT(CASE WHEN verified THEN 1 END) as verified_suppliers,
        AVG(sustainability_score) as avg_supplier_sustainability
      FROM suppliers WHERE is_active = true
    ),
    tracking_stats AS (
      SELECT 
        COUNT(*) as total_tracking_events,
        COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as active_shipments,
        COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as daily_scans
      FROM tracking_events
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    ),
    scan_stats AS (
      SELECT 
        COUNT(*) as total_scans,
        COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as daily_qr_scans
      FROM qr_scan_logs
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    ),
    blockchain_stats AS (
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_transactions
      FROM blockchain_transactions
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    ),
    inventory_stats AS (
      SELECT 
        SUM(quantity) as total_inventory,
        AVG(quantity) as avg_inventory_per_location,
        COUNT(DISTINCT store_location) as store_locations
      FROM inventory
    )
    SELECT 
      ps.total_products,
      ps.active_products,
      ps.avg_sustainability,
      ps.total_carbon_footprint,
      ss.total_suppliers,
      ss.verified_suppliers,
      ss.avg_supplier_sustainability,
      ts.total_tracking_events,
      ts.active_shipments,
      ts.daily_scans,
      scs.total_scans,
      scs.daily_qr_scans,
      bs.total_transactions as blockchain_transactions,
      bs.confirmed_transactions,
      ins.total_inventory,
      ins.avg_inventory_per_location,
      ins.store_locations,
      
      -- Calculate derived metrics
      CASE WHEN ps.total_products > 0 
        THEN (ps.total_carbon_footprint * 0.45) -- Estimated CO2 saved through tracking
        ELSE 0 
      END as co2_saved,
      
      -- Revenue impact (placeholder calculation)
      (ps.active_products * 1500) as estimated_revenue_impact,
      
      -- Cost savings (placeholder calculation)  
      (ss.verified_suppliers * 2500) as estimated_cost_savings,
      
      -- Average delivery time (placeholder - would need actual delivery data)
      3.2 as average_delivery_time,
      
      -- Customer satisfaction (placeholder - would need actual feedback data)
      4.7 as customer_satisfaction
      
    FROM product_stats ps
    CROSS JOIN supplier_stats ss
    CROSS JOIN tracking_stats ts  
    CROSS JOIN scan_stats scs
    CROSS JOIN blockchain_stats bs
    CROSS JOIN inventory_stats ins
  `;

  const db = getMongoDB();

  // Get dashboard statistics using MongoDB aggregations
  const [productStats, supplierStats, trackingStats, scanStats, blockchainStats, inventoryStats] = await Promise.all([
    // Product stats
    db.collection('products').aggregate([
      {
        $group: {
          _id: null,
          total_products: { $sum: 1 },
          active_products: {
            $sum: { $cond: [{ $eq: ['$is_active', true] }, 1, 0] }
          },
          avg_sustainability: { $avg: '$sustainability_score' },
          total_carbon_footprint: { $sum: '$carbon_footprint' }
        }
      }
    ]).toArray(),
    
    // Supplier stats
    db.collection('suppliers').aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: null,
          total_suppliers: { $sum: 1 },
          verified_suppliers: {
            $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] }
          },
          avg_supplier_sustainability: { $avg: '$sustainability_score' }
        }
      }
    ]).toArray(),
    
    // Tracking stats (last 30 days)
    db.collection('tracking_events').aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          total_tracking_events: { $sum: 1 },
          active_shipments: {
            $sum: { $cond: [{ $eq: ['$status', 'in_transit'] }, 1, 0] }
          },
          daily_scans: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$timestamp',
                    new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray(),
    
    // QR Scan stats (last 30 days)
    db.collection('qr_scan_logs').aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          total_scans: { $sum: 1 },
          daily_qr_scans: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$timestamp',
                    new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray(),
    
    // Blockchain stats (last 30 days)
    db.collection('blockchain_transactions').aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          total_transactions: { $sum: 1 },
          confirmed_transactions: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          }
        }
      }
    ]).toArray(),
    
    // Inventory stats (mock data for now)
    Promise.resolve([{
      total_inventory: 50000,
      avg_inventory_per_location: 2500,
      store_locations: 20
    }])
  ]);

  const ps = productStats[0] || { total_products: 0, active_products: 0, avg_sustainability: 0, total_carbon_footprint: 0 };
  const ss = supplierStats[0] || { total_suppliers: 0, verified_suppliers: 0, avg_supplier_sustainability: 0 };
  const ts = trackingStats[0] || { total_tracking_events: 0, active_shipments: 0, daily_scans: 0 };
  const scs = scanStats[0] || { total_scans: 0, daily_qr_scans: 0 };
  const bs = blockchainStats[0] || { total_transactions: 0, confirmed_transactions: 0 };
  const ins = inventoryStats[0] || { total_inventory: 0, avg_inventory_per_location: 0, store_locations: 0 };

  const stats = {
    total_products: ps.total_products,
    active_products: ps.active_products,
    avg_sustainability: ps.avg_sustainability,
    total_carbon_footprint: ps.total_carbon_footprint,
    total_suppliers: ss.total_suppliers,
    verified_suppliers: ss.verified_suppliers,
    avg_supplier_sustainability: ss.avg_supplier_sustainability,
    total_tracking_events: ts.total_tracking_events,
    active_shipments: ts.active_shipments,
    daily_scans: ts.daily_scans,
    total_scans: scs.total_scans,
    daily_qr_scans: scs.daily_qr_scans,
    blockchain_transactions: bs.total_transactions,
    confirmed_transactions: bs.confirmed_transactions,
    total_inventory: ins.total_inventory,
    avg_inventory_per_location: ins.avg_inventory_per_location,
    store_locations: ins.store_locations,
    // Calculate derived metrics
    co2_saved: ps.total_products > 0 ? (ps.total_carbon_footprint * 0.45) : 0,
    estimated_revenue_impact: ps.active_products * 1500,
    estimated_cost_savings: ss.verified_suppliers * 2500,
    average_delivery_time: 3.2,
    customer_satisfaction: 4.7
  };

  const dashboardStats: DashboardStats = {
    products_tracked: stats.active_products,
    active_shipments: stats.active_shipments,
    verified_suppliers: stats.verified_suppliers,
    co2_saved: stats.co2_saved,
    daily_scans: stats.daily_scans + stats.daily_qr_scans,
    blockchain_transactions: stats.blockchain_transactions,
    average_delivery_time: stats.average_delivery_time,
    customer_satisfaction: stats.customer_satisfaction,
    revenue_impact: stats.estimated_revenue_impact,
    cost_savings: stats.estimated_cost_savings
  };

  const response: ApiResponse<DashboardStats> = {
    success: true,
    data: dashboardStats,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get supply chain metrics
router.get('/supply-chain', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const metricsQuery = `
    WITH delivery_performance AS (
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN te_delivered.timestamp <= te_expected.expected_delivery THEN 1 END) as on_time_deliveries,
        AVG(EXTRACT(EPOCH FROM (te_delivered.timestamp - te_created.timestamp))/3600) as avg_delivery_hours
      FROM tracking_events te_created
      JOIN tracking_events te_delivered ON te_created.product_id = te_delivered.product_id
      LEFT JOIN (
        SELECT product_id, timestamp + INTERVAL '72 hours' as expected_delivery
        FROM tracking_events 
        WHERE status = 'in_transit'
      ) te_expected ON te_created.product_id = te_expected.product_id
      WHERE te_created.status = 'created' 
        AND te_delivered.status = 'delivered'
        AND te_created.timestamp >= NOW() - INTERVAL '90 days'
    ),
    quality_metrics AS (
      SELECT 
        AVG(sustainability_score) as avg_sustainability,
        AVG(performance_rating) as avg_supplier_performance,
        COUNT(CASE WHEN quality_score >= 4.0 THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as quality_score_percentage
      FROM suppliers 
      WHERE is_active = true
    ),
    cost_metrics AS (
      SELECT 
        AVG(cost_efficiency) as avg_cost_efficiency,
        SUM(price * i.quantity) as total_inventory_value,
        COUNT(DISTINCT i.store_location) as locations_count
      FROM suppliers s
      JOIN products p ON s.id = p.supplier_id
      JOIN inventory i ON p.id = i.product_id
      WHERE s.is_active = true AND p.is_active = true
    ),
    sustainability_metrics AS (
      SELECT 
        AVG(p.sustainability_score) as avg_product_sustainability,
        SUM(p.carbon_footprint) as total_carbon_footprint,
        COUNT(CASE WHEN p.sustainability_score >= 8.0 THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as high_sustainability_percentage
      FROM products p
      WHERE p.is_active = true
    ),
    inventory_turnover AS (
      SELECT 
        COUNT(DISTINCT te.product_id)::float / NULLIF(COUNT(DISTINCT i.product_id), 0) as turnover_ratio
      FROM inventory i
      LEFT JOIN tracking_events te ON i.product_id = te.product_id 
        AND te.timestamp >= NOW() - INTERVAL '30 days'
    )
    SELECT 
      dp.total_deliveries,
      dp.on_time_deliveries,
      dp.avg_delivery_hours,
      CASE WHEN dp.total_deliveries > 0 
        THEN (dp.on_time_deliveries::float / dp.total_deliveries * 100)
        ELSE 0 
      END as on_time_delivery_percentage,
      
      qm.avg_sustainability as supplier_sustainability,
      qm.avg_supplier_performance,
      qm.quality_score_percentage,
      
      cm.avg_cost_efficiency,
      cm.total_inventory_value,
      cm.locations_count,
      
      sm.avg_product_sustainability,
      sm.total_carbon_footprint,
      sm.high_sustainability_percentage,
      
      it.turnover_ratio,
      
      -- Waste reduction calculation (placeholder)
      GREATEST(0, 100 - (sm.total_carbon_footprint / NULLIF(cm.total_inventory_value, 0) * 10000)) as waste_reduction_percentage
      
    FROM delivery_performance dp
    CROSS JOIN quality_metrics qm
    CROSS JOIN cost_metrics cm  
    CROSS JOIN sustainability_metrics sm
    CROSS JOIN inventory_turnover it
  `;

  const db = getMongoDB();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Get supply chain metrics using MongoDB aggregations
  const [deliveryMetrics, qualityMetrics, sustainabilityMetrics] = await Promise.all([
    // Mock delivery performance for now
    Promise.resolve({
      total_deliveries: 1200,
      on_time_deliveries: 1140,
      avg_delivery_hours: 48,
      on_time_delivery_percentage: 95
    }),
    
    // Quality metrics from suppliers
    db.collection('suppliers').aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: null,
          avg_sustainability: { $avg: '$sustainability_score' },
          avg_supplier_performance: { $avg: '$performance_rating' },
          quality_score_percentage: {
            $avg: {
              $cond: [
                { $gte: ['$quality_score', 4.0] },
                100,
                { $multiply: ['$quality_score', 20] }
              ]
            }
          }
        }
      }
    ]).toArray(),
    
    // Sustainability metrics from products
    db.collection('products').aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: null,
          avg_product_sustainability: { $avg: '$sustainability_score' },
          total_carbon_footprint: { $sum: '$carbon_footprint' },
          high_sustainability_count: {
            $sum: { $cond: [{ $gte: ['$sustainability_score', 8.0] }, 1, 0] }
          },
          total_products: { $sum: 1 }
        }
      },
      {
        $addFields: {
          high_sustainability_percentage: {
            $multiply: [
              { $divide: ['$high_sustainability_count', '$total_products'] },
              100
            ]
          }
        }
      }
    ]).toArray()
  ]);

  const dm = deliveryMetrics;
  const qm = qualityMetrics[0] || { avg_sustainability: 0, avg_supplier_performance: 0, quality_score_percentage: 0 };
  const sm = sustainabilityMetrics[0] || { avg_product_sustainability: 0, total_carbon_footprint: 0, high_sustainability_percentage: 0 };

  // Mock cost and inventory metrics
  const costMetrics = {
    avg_cost_efficiency: 85.5,
    total_inventory_value: 2500000,
    locations_count: 25
  };

  const inventoryTurnover = { turnover_ratio: 0.75 };

  const metrics = {
    total_deliveries: dm.total_deliveries,
    on_time_deliveries: dm.on_time_deliveries,
    avg_delivery_hours: dm.avg_delivery_hours,
    on_time_delivery_percentage: dm.on_time_delivery_percentage,
    avg_sustainability: qm.avg_sustainability,
    avg_supplier_performance: qm.avg_supplier_performance,
    quality_score_percentage: qm.quality_score_percentage,
    avg_cost_efficiency: costMetrics.avg_cost_efficiency,
    total_inventory_value: costMetrics.total_inventory_value,
    locations_count: costMetrics.locations_count,
    avg_product_sustainability: sm.avg_product_sustainability,
    total_carbon_footprint: sm.total_carbon_footprint,
    high_sustainability_percentage: sm.high_sustainability_percentage,
    turnover_ratio: inventoryTurnover.turnover_ratio,
    waste_reduction_percentage: Math.max(0, 100 - (sm.total_carbon_footprint / costMetrics.total_inventory_value * 10000))
  };

  const supplyChainMetrics: SupplyChainMetrics = {
    on_time_delivery: metrics.on_time_delivery_percentage || 0,
    quality_score: metrics.quality_score_percentage || 0,
    sustainability_score: metrics.avg_product_sustainability || 0,
    cost_efficiency: metrics.avg_cost_efficiency || 0,
    carbon_footprint: metrics.total_carbon_footprint || 0,
    supplier_performance: metrics.avg_supplier_performance || 0,
    inventory_turnover: metrics.turnover_ratio || 0,
    waste_reduction: metrics.waste_reduction_percentage || 0
  };

  const response: ApiResponse<SupplyChainMetrics> = {
    success: true,
    data: supplyChainMetrics,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get sustainability metrics
router.get('/sustainability', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sustainabilityQuery = `
    WITH product_sustainability AS (
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG(sustainability_score) as avg_score,
        SUM(carbon_footprint) as total_carbon,
        AVG(carbon_footprint) as avg_carbon
      FROM products 
      WHERE is_active = true
      GROUP BY category
    ),
    supplier_sustainability AS (
      SELECT 
        certification_level,
        COUNT(*) as supplier_count,
        AVG(sustainability_score) as avg_score
      FROM suppliers 
      WHERE is_active = true
      GROUP BY certification_level
    ),
    carbon_trends AS (
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(carbon_footprint) as monthly_carbon
      FROM products 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    )
    SELECT 
      (SELECT json_agg(row_to_json(ps)) FROM product_sustainability ps) as product_breakdown,
      (SELECT json_agg(row_to_json(ss)) FROM supplier_sustainability ss) as supplier_breakdown,
      (SELECT json_agg(row_to_json(ct)) FROM carbon_trends ct) as carbon_trends,
      
      -- Overall metrics
      (SELECT AVG(sustainability_score) FROM products WHERE is_active = true) as overall_product_sustainability,
      (SELECT AVG(sustainability_score) FROM suppliers WHERE is_active = true) as overall_supplier_sustainability,
      (SELECT SUM(carbon_footprint) FROM products WHERE is_active = true) as total_carbon_footprint,
      (SELECT COUNT(*) FROM suppliers WHERE verified = true AND is_active = true) as verified_sustainable_suppliers
  `;

  const db = getMongoDB();
  const twelveMonthsAgo = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);

  // Get sustainability metrics using MongoDB aggregations
  const [productBreakdown, supplierBreakdown, carbonTrends, overallMetrics] = await Promise.all([
    // Product sustainability by category
    db.collection('products').aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: '$category',
          product_count: { $sum: 1 },
          avg_score: { $avg: '$sustainability_score' },
          total_carbon: { $sum: '$carbon_footprint' },
          avg_carbon: { $avg: '$carbon_footprint' }
        }
      },
      {
        $project: {
          category: '$_id',
          product_count: 1,
          avg_score: 1,
          total_carbon: 1,
          avg_carbon: 1,
          _id: 0
        }
      }
    ]).toArray(),
    
    // Supplier sustainability by certification level
    db.collection('suppliers').aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: '$certification_level',
          supplier_count: { $sum: 1 },
          avg_score: { $avg: '$sustainability_score' }
        }
      },
      {
        $project: {
          certification_level: '$_id',
          supplier_count: 1,
          avg_score: 1,
          _id: 0
        }
      }
    ]).toArray(),
    
    // Carbon trends (simplified - monthly aggregation)
    db.collection('products').aggregate([
      {
        $match: {
          created_at: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          monthly_carbon: { $sum: '$carbon_footprint' }
        }
      },
      {
        $project: {
          month: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: 1
            }
          },
          monthly_carbon: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]).toArray(),
    
    // Overall metrics
    Promise.all([
      db.collection('products').aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: null,
            overall_product_sustainability: { $avg: '$sustainability_score' },
            total_carbon_footprint: { $sum: '$carbon_footprint' }
          }
        }
      ]).toArray(),
      db.collection('suppliers').aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: null,
            overall_supplier_sustainability: { $avg: '$sustainability_score' },
            verified_sustainable_suppliers: {
              $sum: { $cond: [{ $and: [{ $eq: ['$verified', true] }, { $eq: ['$is_active', true] }] }, 1, 0] }
            }
          }
        }
      ]).toArray()
    ])
  ]);

  const [productOverall, supplierOverall] = overallMetrics;
  const productOverallData = productOverall[0] || { overall_product_sustainability: 0, total_carbon_footprint: 0 };
  const supplierOverallData = supplierOverall[0] || { overall_supplier_sustainability: 0, verified_sustainable_suppliers: 0 };

  const data = {
    product_breakdown: productBreakdown,
    supplier_breakdown: supplierBreakdown,
    carbon_trends: carbonTrends,
    overall_product_sustainability: productOverallData.overall_product_sustainability,
    overall_supplier_sustainability: supplierOverallData.overall_supplier_sustainability,
    total_carbon_footprint: productOverallData.total_carbon_footprint,
    verified_sustainable_suppliers: supplierOverallData.verified_sustainable_suppliers
  };

  const response: ApiResponse<any> = {
    success: true,
    data: {
      overview: {
        overall_product_sustainability: data.overall_product_sustainability || 0,
        overall_supplier_sustainability: data.overall_supplier_sustainability || 0,
        total_carbon_footprint: data.total_carbon_footprint || 0,
        verified_sustainable_suppliers: data.verified_sustainable_suppliers || 0
      },
      product_breakdown: data.product_breakdown || [],
      supplier_breakdown: data.supplier_breakdown || [],
      carbon_trends: data.carbon_trends || []
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get performance analytics
router.get('/performance', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { timeframe = '30d' } = req.query;
  
  let intervalClause = "INTERVAL '30 days'";
  switch (timeframe) {
    case '7d':
      intervalClause = "INTERVAL '7 days'";
      break;
    case '90d':
      intervalClause = "INTERVAL '90 days'";
      break;
    case '1y':
      intervalClause = "INTERVAL '1 year'";
      break;
  }

  const performanceQuery = `
    WITH daily_metrics AS (
      SELECT 
        DATE_TRUNC('day', timestamp) as day,
        COUNT(DISTINCT product_id) as products_tracked,
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as deliveries
      FROM tracking_events
      WHERE timestamp >= NOW() - ${intervalClause}
      GROUP BY day
      ORDER BY day
    ),
    scan_metrics AS (
      SELECT 
        DATE_TRUNC('day', timestamp) as day,
        COUNT(*) as scan_count,
        COUNT(DISTINCT product_id) as unique_products_scanned
      FROM qr_scan_logs
      WHERE timestamp >= NOW() - ${intervalClause}
      GROUP BY day
      ORDER BY day
    ),
    supplier_metrics AS (
      SELECT 
        s.name,
        s.performance_rating,
        COUNT(p.id) as product_count,
        AVG(p.sustainability_score) as avg_sustainability
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id AND p.is_active = true
      WHERE s.is_active = true
      ORDER BY s.performance_rating DESC
      LIMIT 10
    ),
    location_metrics AS (
      SELECT 
        location,
        COUNT(*) as event_count,
        COUNT(DISTINCT product_id) as unique_products
      FROM tracking_events
      WHERE timestamp >= NOW() - ${intervalClause}
      GROUP BY location
      ORDER BY event_count DESC
      LIMIT 10
    )
    SELECT 
      (SELECT json_agg(row_to_json(dm)) FROM daily_metrics dm) as daily_tracking,
      (SELECT json_agg(row_to_json(sm)) FROM scan_metrics sm) as daily_scans,
      (SELECT json_agg(row_to_json(spm)) FROM supplier_metrics spm) as top_suppliers,
      (SELECT json_agg(row_to_json(lm)) FROM location_metrics lm) as top_locations
  `;

  const db = getMongoDB();
  let timeframeDate;
  
  switch (timeframe) {
    case '7d':
      timeframeDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      timeframeDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      timeframeDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      timeframeDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get performance analytics using MongoDB aggregations
  const [dailyTracking, dailyScans, topSuppliers, topLocations] = await Promise.all([
    // Daily tracking metrics
    db.collection('tracking_events').aggregate([
      {
        $match: {
          timestamp: { $gte: timeframeDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          products_tracked: { $addToSet: '$product_id' },
          total_events: { $sum: 1 },
          deliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          day: '$_id',
          products_tracked: { $size: '$products_tracked' },
          total_events: 1,
          deliveries: 1,
          _id: 0
        }
      },
      { $sort: { day: 1 } }
    ]).toArray(),
    
    // Daily scan metrics
    db.collection('qr_scan_logs').aggregate([
      {
        $match: {
          timestamp: { $gte: timeframeDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          scan_count: { $sum: 1 },
          unique_products_scanned: { $addToSet: '$product_id' }
        }
      },
      {
        $project: {
          day: '$_id',
          scan_count: 1,
          unique_products_scanned: { $size: '$unique_products_scanned' },
          _id: 0
        }
      },
      { $sort: { day: 1 } }
    ]).toArray(),
    
    // Top suppliers by performance
    db.collection('suppliers').aggregate([
      { $match: { is_active: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'id',
          foreignField: 'supplier_id',
          as: 'products'
        }
      },
      {
        $addFields: {
          product_count: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.is_active', true] }
              }
            }
          },
          avg_sustainability: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: '$products',
                    cond: { $eq: ['$$this.is_active', true] }
                  }
                },
                in: '$$this.sustainability_score'
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          performance_rating: 1,
          product_count: 1,
          avg_sustainability: 1
        }
      },
      { $sort: { performance_rating: -1 } },
      { $limit: 10 }
    ]).toArray(),
    
    // Top locations by activity
    db.collection('tracking_events').aggregate([
      {
        $match: {
          timestamp: { $gte: timeframeDate }
        }
      },
      {
        $group: {
          _id: '$location',
          event_count: { $sum: 1 },
          unique_products: { $addToSet: '$product_id' }
        }
      },
      {
        $project: {
          location: '$_id',
          event_count: 1,
          unique_products: { $size: '$unique_products' },
          _id: 0
        }
      },
      { $sort: { event_count: -1 } },
      { $limit: 10 }
    ]).toArray()
  ]);

  const data = {
    daily_tracking: dailyTracking,
    daily_scans: dailyScans,
    top_suppliers: topSuppliers,
    top_locations: topLocations
  };

  const response: ApiResponse<any> = {
    success: true,
    data: {
      timeframe,
      daily_tracking: data.daily_tracking || [],
      daily_scans: data.daily_scans || [],
      top_suppliers: data.top_suppliers || [],
      top_locations: data.top_locations || []
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get AI predictions summary
router.get('/predictions', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getMongoDB();
    
    // Get recent AI predictions from MongoDB
    const predictions = await db.collection('ai_predictions').aggregate([
      {
        $match: {
          generated_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $group: {
          _id: "$prediction_type",
          count: { $sum: 1 },
          avg_confidence: { $avg: "$confidence" },
          avg_predicted_value: { $avg: "$predicted_value" }
        }
      }
    ]).toArray();

    // Get recent predictions with product details
    const recentPredictions = await db.collection('ai_predictions').find(
      { generated_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { sort: { generated_at: -1 }, limit: 10 }
    ).toArray();

    // Enhance with product information
    const productIds = recentPredictions.map(p => p.product_id);
    const productDetails = await db.collection('products').find(
      { id: { $in: productIds } },
      { projection: { id: 1, name: 1, category: 1 } }
    ).toArray();

    const productsMap: { [key: string]: any } = productDetails.reduce((acc: { [key: string]: any }, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const enhancedPredictions = recentPredictions.map(pred => ({
      ...pred,
      product_name: productsMap[pred.product_id]?.name || 'Unknown',
      product_category: productsMap[pred.product_id]?.category || 'Unknown'
    }));

    const response: ApiResponse<any> = {
      success: true,
      data: {
        summary: predictions,
        recent_predictions: enhancedPredictions,
        total_predictions: recentPredictions.length
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    // Fallback if MongoDB is not available
    const response: ApiResponse<any> = {
      success: true,
      data: {
        summary: [],
        recent_predictions: [],
        total_predictions: 0
      },
      message: 'AI predictions service temporarily unavailable',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  }
}));

// Export data endpoint
router.post('/export',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      type, 
      format = 'json', 
      date_from, 
      date_to,
      include_suppliers = true,
      include_products = true,
      include_tracking = true 
    } = req.body;

    if (!['products', 'suppliers', 'tracking', 'analytics', 'all'].includes(type)) {
      throw new AppError('Invalid export type', 400);
    }

    if (!['json', 'csv'].includes(format)) {
      throw new AppError('Invalid export format', 400);
    }

    const exportData: any = {};

    const db = getMongoDB();

    // Date filtering
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateFromFilter = date_from ? new Date(date_from) : thirtyDaysAgo;
    const dateToFilter = date_to ? new Date(date_to) : new Date();

    try {
      if (type === 'all' || (type === 'products' && include_products)) {
        const products = await db.collection('products').aggregate([
          {
            $match: {
              is_active: true,
              created_at: { $gte: dateFromFilter, $lte: dateToFilter }
            }
          },
          {
            $lookup: {
              from: 'suppliers',
              localField: 'supplier_id',
              foreignField: 'id',
              as: 'supplier_info'
            }
          },
          {
            $addFields: {
              supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] }
            }
          },
          { $unset: ['supplier_info'] }
        ]).toArray();
        exportData.products = products;
      }

      if (type === 'all' || (type === 'suppliers' && include_suppliers)) {
        const suppliers = await db.collection('suppliers').find({
          is_active: true,
          created_at: { $gte: dateFromFilter, $lte: dateToFilter }
        }).toArray();
        exportData.suppliers = suppliers;
      }

      if (type === 'all' || (type === 'tracking' && include_tracking)) {
        const tracking = await db.collection('tracking_events').aggregate([
          {
            $match: {
              timestamp: {
                $gte: date_from && date_to ? dateFromFilter : thirtyDaysAgo,
                ...(date_from && date_to && { $lte: dateToFilter })
              }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'product_id',
              foreignField: 'id',
              as: 'product_info'
            }
          },
          {
            $lookup: {
              from: 'suppliers',
              localField: 'product_info.supplier_id',
              foreignField: 'id',
              as: 'supplier_info'
            }
          },
          {
            $addFields: {
              product_name: { $arrayElemAt: ['$product_info.name', 0] },
              supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] }
            }
          },
          { $unset: ['product_info', 'supplier_info'] }
        ]).toArray();
        exportData.tracking_events = tracking;
      }

      if (type === 'analytics') {
        // Get analytics summary using MongoDB aggregations
        const [productStats, supplierStats, trackingStats] = await Promise.all([
          db.collection('products').aggregate([
            { $match: { is_active: true } },
            {
              $group: {
                _id: null,
                total_products: { $sum: 1 },
                avg_sustainability: { $avg: '$sustainability_score' }
              }
            }
          ]).toArray(),
          db.collection('suppliers').countDocuments({ is_active: true }),
          db.collection('tracking_events').countDocuments({})
        ]);
        
        const productData = productStats[0] || { total_products: 0, avg_sustainability: 0 };
        exportData.analytics_summary = {
          total_products: productData.total_products,
          total_suppliers: supplierStats,
          total_tracking_events: trackingStats,
          avg_sustainability: productData.avg_sustainability
        };
      }

      // Add metadata
      exportData.export_metadata = {
        exported_at: new Date().toISOString(),
        exported_by: req.user?.id,
        export_type: type,
        format,
        date_range: { from: date_from, to: date_to }
      };

      const response: ApiResponse<any> = {
        success: true,
        data: exportData,
        message: `Data exported successfully in ${format} format`,
        timestamp: new Date().toISOString()
      };

      // Set appropriate headers for download
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=chaintrack_export_${Date.now()}.csv`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=chaintrack_export_${Date.now()}.json`);
      }

      res.json(response);
    } catch (error) {
      throw new AppError('Export failed: ' + (error as Error).message, 500);
    }
  })
);

export { router as analyticsRouter };