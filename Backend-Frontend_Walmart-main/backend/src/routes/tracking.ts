import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMongoDB } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  createTrackingEventValidation,
  qrScanValidation,
  uuidParamValidation,
  paginationValidation
} from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest, ApiResponse, TrackingEvent, QRScanLog } from '../types/index.js';

const router = Router();

// Create new tracking event
router.post('/events',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff', 'supplier'),
  createTrackingEventValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      product_id,
      location,
      status,
      description,
      coordinates,
      temperature,
      humidity,
      blockchain_tx_hash,
      metadata
    } = req.body;

    const db = getMongoDB();

    // Verify product exists
    const product = await db.collection('products').findOne({ 
      id: product_id, 
      is_active: true 
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const eventId = uuidv4();
    const trackingEvent = {
      id: eventId,
      product_id,
      location,
      status,
      description,
      coordinates,
      temperature,
      humidity,
      blockchain_tx_hash,
      scanned_by: req.user?.id,
      metadata,
      timestamp: new Date()
    };

    await db.collection('tracking_events').insertOne(trackingEvent);

    logger.info('Tracking event created', {
      eventId: trackingEvent.id,
      productId: product_id,
      status,
      location,
      createdBy: req.user?.id
    });

    const response: ApiResponse<TrackingEvent> = {
      success: true,
      data: trackingEvent,
      message: 'Tracking event created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  })
);

// Get tracking events for a product
router.get('/products/:productId/events',
  uuidParamValidation,
  paginationValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const db = getMongoDB();

    // Verify product exists
    const product = await db.collection('products').findOne({ 
      id: productId, 
      is_active: true 
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const skip = ((page as number) - 1) * (limit as number);

    const [events, total] = await Promise.all([
      db.collection('tracking_events').aggregate([
        { $match: { product_id: productId } },
        { $sort: { timestamp: -1 } },
        { $skip: skip },
        { $limit: limit as number },
        {
          $lookup: {
            from: 'users',
            localField: 'scanned_by',
            foreignField: 'id',
            as: 'scanned_by_info'
          }
        },
        {
          $addFields: {
            scanned_by_name: { $arrayElemAt: ['$scanned_by_info.name', 0] },
            scanned_by_role: { $arrayElemAt: ['$scanned_by_info.role', 0] }
          }
        },
        { $unset: ['scanned_by_info'] }
      ]).toArray(),
      db.collection('tracking_events').countDocuments({ product_id: productId })
    ]);

    const totalPages = Math.ceil(total / (limit as number));

    const response: ApiResponse<{
      product: { id: string; name: string };
      events: TrackingEvent[];
      pagination: any;
    }> = {
      success: true,
      data: {
        product: { id: product.id, name: product.name },
        events,
        pagination: {
          current_page: page as number,
          per_page: limit as number,
          total,
          total_pages: totalPages,
          has_next: (page as number) < totalPages,
          has_prev: (page as number) > 1
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Get recent tracking events across all products
router.get('/events/recent', paginationValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit = 20 } = req.query;

  const db = getMongoDB();

  const events = await db.collection('tracking_events').aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product_id',
        foreignField: 'id',
        as: 'product_info'
      }
    },
    {
      $match: {
        'product_info.is_active': true
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
      $lookup: {
        from: 'users',
        localField: 'scanned_by',
        foreignField: 'id',
        as: 'user_info'
      }
    },
    {
      $addFields: {
        product_name: { $arrayElemAt: ['$product_info.name', 0] },
        product_sku: { $arrayElemAt: ['$product_info.sku', 0] },
        product_category: { $arrayElemAt: ['$product_info.category', 0] },
        supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] },
        scanned_by_name: { $arrayElemAt: ['$user_info.name', 0] }
      }
    },
    { $unset: ['product_info', 'supplier_info', 'user_info'] },
    { $sort: { timestamp: -1 } },
    { $limit: limit as number }
  ]).toArray();

  const response: ApiResponse<TrackingEvent[]> = {
    success: true,
    data: events,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Update tracking event location
router.put('/events/:id/location',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff', 'supplier'),
  uuidParamValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { location, coordinates, status } = req.body;

    if (!location) {
      throw new AppError('Location is required', 400);
    }

    const result = await pool.query(`
      UPDATE tracking_events 
      SET location = $1, coordinates = $2, status = COALESCE($3, status)
      WHERE id = $4
      RETURNING *
    `, [
      location,
      coordinates ? JSON.stringify(coordinates) : null,
      status,
      id
    ]);

    if (result.rows.length === 0) {
      throw new AppError('Tracking event not found', 404);
    }

    const updatedEvent = result.rows[0];

    logger.info('Tracking event location updated', {
      eventId: id,
      newLocation: location,
      updatedBy: req.user?.id
    });

    const response: ApiResponse<TrackingEvent> = {
      success: true,
      data: updatedEvent,
      message: 'Location updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// QR Code scan endpoint
router.post('/scan',
  qrScanValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      product_id,
      scan_location,
      coordinates
    } = req.body;

    const db = getMongoDB();

    // Verify product exists
    const product = await db.collection('products').findOne({ 
      id: product_id, 
      is_active: true 
    });

    if (!product) {
      throw new AppError('Product not found or inactive', 404);
    }

    // Get supplier information
    const supplier = await db.collection('suppliers').findOne({ 
      id: product.supplier_id 
    });

    // Get user info from token if available
    const scannedBy = req.user?.id || null;

    // Extract device info from request
    const deviceInfo = {
      user_agent: req.get('User-Agent') || 'Unknown',
      ip_address: req.ip,
      device_type: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 
                   req.get('User-Agent')?.includes('Tablet') ? 'tablet' : 'desktop'
    };

    // Log scan to MongoDB
    const scanId = uuidv4();
    await db.collection('qr_scan_logs').insertOne({
      id: scanId,
      product_id,
      scanned_by: scannedBy,
      scan_location,
      coordinates,
      device_info: deviceInfo,
      scan_result: 'success',
      timestamp: new Date()
    });

    // Create tracking event
    const trackingEventId = uuidv4();
    await db.collection('tracking_events').insertOne({
      id: trackingEventId,
      product_id,
      location: scan_location,
      status: 'in_store',
      description: `QR code scanned at ${scan_location}`,
      coordinates,
      timestamp: new Date(),
      scanned_by: scannedBy,
      device_info: deviceInfo
    });

    // Create blockchain transaction record
    const blockchainTxId = uuidv4();
    const mockTxHash = generateMockTransactionHash();
    await db.collection('blockchain_transactions').insertOne({
      id: blockchainTxId,
      transaction_hash: mockTxHash,
      product_id,
      action: 'verify',
      from_address: '0x0000000000000000000000000000000000000000',
      to_address: '0x1234567890123456789012345678901234567890',
      status: 'confirmed',
      timestamp: new Date(),
      metadata: {
        scan_location,
        device_type: deviceInfo.device_type
      }
    });

    // Get latest tracking information
    const latestTracking = await db.collection('tracking_events')
      .findOne(
        { product_id },
        { sort: { timestamp: -1 } }
      );

    logger.info('QR code scanned', {
      productId: product_id,
      scanLocation: scan_location,
      scannedBy,
      deviceType: deviceInfo.device_type
    });

    const response: ApiResponse<{
      product: any;
      latest_tracking: TrackingEvent | null;
      scan_log: { id: string; timestamp: string };
    }> = {
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          supplier_name: supplier?.name || 'Unknown',
          sustainability_score: product.sustainability_score,
          price: product.price
        },
        latest_tracking: latestTracking,
        scan_log: {
          id: scanId,
          timestamp: new Date().toISOString()
        }
      },
      message: 'Product scanned successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Helper function to generate mock transaction hashes
function generateMockTransactionHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get scan statistics
router.get('/scans/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { timeframe = '7d' } = req.query;

  let intervalClause = "INTERVAL '7 days'";
  switch (timeframe) {
    case '1d':
      intervalClause = "INTERVAL '1 day'";
      break;
    case '30d':
      intervalClause = "INTERVAL '30 days'";
      break;
    case '90d':
      intervalClause = "INTERVAL '90 days'";
      break;
  }

  const statsQuery = `
    WITH scan_stats AS (
      SELECT 
        COUNT(*) as total_scans,
        COUNT(DISTINCT product_id) as unique_products_scanned,
        COUNT(DISTINCT scanned_by) as unique_scanners,
        COUNT(CASE WHEN scan_result = 'success' THEN 1 END) as successful_scans,
        COUNT(CASE WHEN device_info->>'device_type' = 'mobile' THEN 1 END) as mobile_scans,
        COUNT(CASE WHEN device_info->>'device_type' = 'desktop' THEN 1 END) as desktop_scans
      FROM qr_scan_logs 
      WHERE timestamp >= NOW() - ${intervalClause}
    ),
    hourly_scans AS (
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as scan_count
      FROM qr_scan_logs 
      WHERE timestamp >= NOW() - ${intervalClause}
      GROUP BY hour
      ORDER BY hour
    ),
    top_products AS (
      SELECT 
        p.name as product_name,
        p.sku,
        COUNT(qsl.id) as scan_count
      FROM qr_scan_logs qsl
      JOIN products p ON qsl.product_id = p.id
      WHERE qsl.timestamp >= NOW() - ${intervalClause}
      GROUP BY p.id, p.name, p.sku
      ORDER BY scan_count DESC
      LIMIT 10
    )
    SELECT 
      ss.*,
      (SELECT json_agg(row_to_json(hs)) FROM hourly_scans hs) as hourly_breakdown,
      (SELECT json_agg(row_to_json(tp)) FROM top_products tp) as top_products
    FROM scan_stats ss
  `;

  const result = await pool.query(statsQuery);
  const stats = result.rows[0];

  const response: ApiResponse<any> = {
    success: true,
    data: {
      timeframe,
      total_scans: parseInt(stats.total_scans),
      unique_products_scanned: parseInt(stats.unique_products_scanned),
      unique_scanners: parseInt(stats.unique_scanners),
      successful_scans: parseInt(stats.successful_scans),
      success_rate: stats.total_scans > 0 ? (stats.successful_scans / stats.total_scans * 100).toFixed(2) : '0',
      device_breakdown: {
        mobile: parseInt(stats.mobile_scans),
        desktop: parseInt(stats.desktop_scans)
      },
      hourly_breakdown: stats.hourly_breakdown || [],
      top_products: stats.top_products || []
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get tracking events by location
router.get('/locations/:location/events', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { location } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const offset = ((page as number) - 1) * (limit as number);

  const [eventsResult, countResult] = await Promise.all([
    pool.query(`
      SELECT 
        te.*,
        p.name as product_name,
        p.sku as product_sku,
        s.name as supplier_name
      FROM tracking_events te
      JOIN products p ON te.product_id = p.id
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE te.location ILIKE $1 AND p.is_active = true
      ORDER BY te.timestamp DESC
      LIMIT $2 OFFSET $3
    `, [`%${location}%`, limit, offset]),
    pool.query(`
      SELECT COUNT(*) as total
      FROM tracking_events te
      JOIN products p ON te.product_id = p.id
      WHERE te.location ILIKE $1 AND p.is_active = true
    `, [`%${location}%`])
  ]);

  const events = eventsResult.rows;
  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / (limit as number));

  const response: ApiResponse<{
    location: string;
    events: TrackingEvent[];
    pagination: any;
  }> = {
    success: true,
    data: {
      location,
      events,
      pagination: {
        current_page: page as number,
        per_page: limit as number,
        total,
        total_pages: totalPages,
        has_next: (page as number) < totalPages,
        has_prev: (page as number) > 1
      }
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Bulk update tracking events
router.post('/events/bulk',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      throw new AppError('Events array is required', 400);
    }

    if (events.length > 100) {
      throw new AppError('Maximum 100 events allowed per bulk request', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const createdEvents = [];
      for (const event of events) {
        const eventId = uuidv4();
        const result = await client.query(`
          INSERT INTO tracking_events (
            id, product_id, location, status, description, coordinates, 
            temperature, humidity, blockchain_tx_hash, scanned_by, metadata, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          RETURNING id, product_id, location, status, timestamp
        `, [
          eventId, event.product_id, event.location, event.status, event.description,
          event.coordinates ? JSON.stringify(event.coordinates) : null,
          event.temperature, event.humidity, event.blockchain_tx_hash,
          req.user?.id, event.metadata ? JSON.stringify(event.metadata) : null
        ]);

        createdEvents.push(result.rows[0]);
      }

      await client.query('COMMIT');

      logger.info('Bulk tracking events created', {
        count: events.length,
        createdBy: req.user?.id
      });

      const response: ApiResponse<{ created_events: any[]; count: number }> = {
        success: true,
        data: {
          created_events: createdEvents,
          count: createdEvents.length
        },
        message: `${createdEvents.length} tracking events created successfully`,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  })
);

export { router as trackingRouter };