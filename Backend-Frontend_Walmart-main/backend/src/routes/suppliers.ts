import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMongoDB } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  createSupplierValidation,
  uuidParamValidation,
  paginationValidation
} from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest, ApiResponse, Supplier, SupplierFilters } from '../types/index.js';

const router = Router();

// Get all suppliers with filtering and pagination
router.get('/', paginationValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = 1,
    limit = 20,
    location,
    min_sustainability,
    verified,
    certification_level,
    search,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query as SupplierFilters;

  let whereClause = 'WHERE s.is_active = true';
  const queryParams: any[] = [];
  let paramCount = 0;

  // Build dynamic WHERE clause
  if (location) {
    paramCount++;
    whereClause += ` AND s.location ILIKE $${paramCount}`;
    queryParams.push(`%${location}%`);
  }

  if (min_sustainability) {
    paramCount++;
    whereClause += ` AND s.sustainability_score >= $${paramCount}`;
    queryParams.push(min_sustainability);
  }

  if (verified !== undefined) {
    paramCount++;
    whereClause += ` AND s.verified = $${paramCount}`;
    queryParams.push(verified === 'true');
  }

  if (certification_level) {
    paramCount++;
    whereClause += ` AND s.certification_level = $${paramCount}`;
    queryParams.push(certification_level);
  }

  if (search) {
    paramCount++;
    whereClause += ` AND (s.name ILIKE $${paramCount} OR s.location ILIKE $${paramCount})`;
    queryParams.push(`%${search}%`);
  }

  // Validate sort field
  const allowedSortFields = ['name', 'location', 'sustainability_score', 'performance_rating', 'created_at'];
  const sortField = allowedSortFields.includes(sort_by as string) ? sort_by : 'created_at';
  const orderDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

  // Calculate offset
  const offset = ((page as number) - 1) * (limit as number);
  paramCount += 2;
  const limitParam = paramCount - 1;
  const offsetParam = paramCount;
  queryParams.push(limit, offset);

  // Main query with additional metrics
  const query = `
    SELECT 
      s.*,
      COUNT(p.id) as total_products,
      COUNT(CASE WHEN p.is_active THEN 1 END) as active_products,
      AVG(p.sustainability_score) as avg_product_sustainability,
      AVG(p.price) as avg_product_price,
      (SELECT COUNT(*) FROM users u WHERE u.supplier_id = s.id AND u.is_active = true) as user_count
    FROM suppliers s
    LEFT JOIN products p ON s.id = p.supplier_id
    ${whereClause}
    GROUP BY s.id
    ORDER BY s.${sortField} ${orderDirection}
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM suppliers s
    ${whereClause}
  `;

  const db = getMongoDB();

  // Build MongoDB filter
  const filter: any = { is_active: true };
  
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (min_sustainability) filter.sustainability_score = { $gte: parseFloat(min_sustainability as string) };
  if (verified !== undefined) filter.verified = verified === 'true';
  if (certification_level) filter.certification_level = certification_level;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sortObj: any = {};
  sortObj[sortField as string] = sort_order === 'asc' ? 1 : -1;

  const skip = ((page as number) - 1) * (limit as number);

  const [suppliers, total] = await Promise.all([
    db.collection('suppliers').aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'products',
          localField: 'id',
          foreignField: 'supplier_id',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'id',
          foreignField: 'supplier_id',
          as: 'users'
        }
      },
      {
        $addFields: {
          total_products: { $size: '$products' },
          active_products: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.is_active', true] }
              }
            }
          },
          avg_product_sustainability: {
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
          },
          avg_product_price: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: '$products',
                    cond: { $eq: ['$$this.is_active', true] }
                  }
                },
                in: '$$this.price'
              }
            }
          },
          user_count: {
            $size: {
              $filter: {
                input: '$users',
                cond: { $eq: ['$$this.is_active', true] }
              }
            }
          }
        }
      },
      { $unset: ['products', 'users'] },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit as number }
    ]).toArray(),
    db.collection('suppliers').countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / (limit as number));

  const response: ApiResponse<{
    suppliers: Supplier[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> = {
    success: true,
    data: {
      suppliers,
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

// Get single supplier by ID
router.get('/:id', uuidParamValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const db = getMongoDB();

  const supplier = await db.collection('suppliers').aggregate([
    { $match: { id, is_active: true } },
    {
      $lookup: {
        from: 'products',
        localField: 'id',
        foreignField: 'supplier_id',
        as: 'products'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'id',
        foreignField: 'supplier_id',
        as: 'users'
      }
    },
    {
      $addFields: {
        total_products: { $size: '$products' },
        active_products: {
          $size: {
            $filter: {
              input: '$products',
              cond: { $eq: ['$$this.is_active', true] }
            }
          }
        },
        avg_product_sustainability: {
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
        },
        avg_product_price: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: '$products',
                  cond: { $eq: ['$$this.is_active', true] }
                }
              },
              in: '$$this.price'
            }
          }
        },
        total_product_value: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$products',
                  cond: { $eq: ['$$this.is_active', true] }
                }
              },
              in: '$$this.price'
            }
          }
        },
        user_count: {
          $size: {
            $filter: {
              input: '$users',
              cond: { $eq: ['$$this.is_active', true] }
            }
          }
        }
      }
    },
    { $unset: ['products', 'users'] }
  ]).toArray();

  if (supplier.length === 0) {
    throw new AppError('Supplier not found', 404);
  }

  const supplierData = supplier[0];

  const response: ApiResponse<Supplier> = {
    success: true,
    data: supplierData,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Create new supplier
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff'),
  createSupplierValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      location,
      contact_email,
      contact_phone,
      sustainability_score,
      certification_level,
      specialties
    } = req.body;

    const db = getMongoDB();

    // Check if supplier already exists with same email
    const existingSupplier = await db.collection('suppliers').findOne({ 
      contact_email 
    });

    if (existingSupplier) {
      throw new AppError('Supplier already exists with this email', 409);
    }

    const supplierId = uuidv4();
    const supplier = {
      id: supplierId,
      name,
      location,
      contact_email,
      contact_phone,
      sustainability_score,
      certification_level,
      specialties,
      verified: false,
      performance_rating: 5.0,
      on_time_delivery: 95.0,
      quality_score: 4.5,
      cost_efficiency: 85.0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('suppliers').insertOne(supplier);

    logger.info('Supplier created', {
      supplierId: supplier.id,
      name: supplier.name,
      createdBy: req.user?.id
    });

    const response: ApiResponse<Supplier> = {
      success: true,
      data: supplierData,
      message: 'Supplier created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  })
);

// Update supplier
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff', 'supplier'),
  uuidParamValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updateFields = req.body;

    const db = getMongoDB();

    // Check if supplier exists
    const existingSupplier = await db.collection('suppliers').findOne({
      id,
      is_active: true
    });

    if (!existingSupplier) {
      throw new AppError('Supplier not found', 404);
    }

    // For supplier role, only allow updating their own profile
    if (req.user?.role === 'supplier') {
      if (id !== req.user.supplier_id) {
        throw new AppError('You can only update your own supplier profile', 403);
      }
      
      // Restrict fields that suppliers can update
      const allowedFields = ['contact_phone', 'specialties'];
      const restrictedFields = Object.keys(updateFields).filter(field => !allowedFields.includes(field));
      
      if (restrictedFields.length > 0) {
        throw new AppError(`Suppliers cannot update these fields: ${restrictedFields.join(', ')}`, 403);
      }
    }

    // Build dynamic update query
    const updateEntries = Object.entries(updateFields).filter(([key, value]) => value !== undefined);
    if (updateEntries.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    const updateData: any = { updated_at: new Date() };
    updateEntries.forEach(([key, value]) => {
      updateData[key] = value;
    });

    const result = await db.collection('suppliers').findOneAndUpdate(
      { id, is_active: true },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    const updatedSupplier = result;

    logger.info('Supplier updated', {
      supplierId: id,
      updatedBy: req.user?.id,
      fieldsUpdated: Object.keys(updateFields)
    });

    const response: ApiResponse<Supplier> = {
      success: true,
      data: updatedSupplier,
      message: 'Supplier updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Delete supplier (soft delete)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  uuidParamValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const db = getMongoDB();

    // Check if supplier has active products
    const productCount = await db.collection('products').countDocuments({
      supplier_id: id,
      is_active: true
    });

    if (productCount > 0) {
      throw new AppError('Cannot delete supplier with active products', 400);
    }

    const result = await db.collection('suppliers').findOneAndUpdate(
      { id, is_active: true },
      { $set: { is_active: false, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Supplier not found', 404);
    }

    const supplier = result;

    // Also deactivate associated users
    await db.collection('users').updateMany(
      { supplier_id: id },
      { $set: { is_active: false } }
    );

    logger.info('Supplier deleted', {
      supplierId: id,
      supplierName: supplier.name,
      deletedBy: req.user?.id
    });

    const response: ApiResponse = {
      success: true,
      message: 'Supplier deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Get supplier performance metrics
router.get('/:id/performance', uuidParamValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const db = getMongoDB();

  // Verify supplier exists
  const supplier = await db.collection('suppliers').findOne({ 
    id, 
    is_active: true 
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  // Get comprehensive performance metrics using MongoDB aggregation
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Get supplier products and recent activity
  const [supplierProducts, recentActivity] = await Promise.all([
    db.collection('products').aggregate([
      { $match: { supplier_id: id, is_active: true } },
      {
        $group: {
          _id: null,
          total_products: { $sum: 1 },
          avg_sustainability: { $avg: '$sustainability_score' },
          avg_price: { $avg: '$price' },
          products_last_30_days: {
            $sum: {
              $cond: [{ $gte: ['$created_at', thirtyDaysAgo] }, 1, 0]
            }
          }
        }
      }
    ]).toArray(),
    db.collection('tracking_events').aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: 'id',
          as: 'product'
        }
      },
      {
        $match: {
          'product.supplier_id': id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          scans_last_30_days: { $sum: 1 },
          products_scanned_last_30_days: { $addToSet: '$product_id' }
        }
      },
      {
        $addFields: {
          products_scanned_last_30_days: { $size: '$products_scanned_last_30_days' }
        }
      }
    ]).toArray()
  ]);

  const productStats = supplierProducts[0] || {
    total_products: 0,
    avg_sustainability: 0,
    avg_price: 0,
    products_last_30_days: 0
  };

  const activityStats = recentActivity[0] || {
    scans_last_30_days: 0,
    products_scanned_last_30_days: 0
  };

  // Mock delivery stats for now (would require more complex tracking data)
  const deliveryStats = {
    total_deliveries: 150,
    successful_deliveries: 142,
    avg_delivery_time_hours: 48,
    delivery_success_rate: 94.7
  };

  const metrics = {
    ...supplier,
    ...productStats,
    ...deliveryStats,
    ...activityStats
  };

  const response: ApiResponse<any> = {
    success: true,
    data: {
      supplier: {
        id: metrics.id,
        name: metrics.name,
        location: metrics.location,
        verified: metrics.verified,
        certification_level: metrics.certification_level
      },
      performance: {
        sustainability_score: metrics.sustainability_score,
        performance_rating: metrics.performance_rating,
        on_time_delivery: metrics.on_time_delivery,
        quality_score: metrics.quality_score,
        cost_efficiency: metrics.cost_efficiency,
        delivery_success_rate: metrics.delivery_success_rate,
        avg_delivery_time_hours: metrics.avg_delivery_time_hours
      },
      products: {
        total_products: metrics.total_products,
        products_last_30_days: metrics.products_last_30_days,
        avg_sustainability: metrics.avg_sustainability,
        avg_price: metrics.avg_price
      },
      activity: {
        scans_last_30_days: metrics.scans_last_30_days,
        products_scanned_last_30_days: metrics.products_scanned_last_30_days
      }
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Verify supplier
router.post('/:id/verify',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff'),
  uuidParamValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { verified = true } = req.body;

    const db = getMongoDB();

    const result = await db.collection('suppliers').findOneAndUpdate(
      { id, is_active: true },
      { $set: { verified, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Supplier not found', 404);
    }

    const supplier = { id: result.id, name: result.name, verified: result.verified };

    logger.info('Supplier verification updated', {
      supplierId: id,
      verified,
      updatedBy: req.user?.id
    });

    const response: ApiResponse<any> = {
      success: true,
      data: supplierData,
      message: `Supplier ${verified ? 'verified' : 'unverified'} successfully`,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Get supplier categories/specialties statistics
router.get('/stats/categories', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const db = getMongoDB();

  const categories = await db.collection('suppliers').aggregate([
    {
      $match: {
        is_active: true,
        specialties: { $exists: true, $ne: null, $ne: [] }
      }
    },
    { $unwind: '$specialties' },
    {
      $group: {
        _id: '$specialties',
        supplier_count: { $sum: 1 },
        avg_sustainability: { $avg: '$sustainability_score' },
        verified_count: {
          $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        specialty: '$_id',
        supplier_count: 1,
        avg_sustainability: 1,
        verified_count: 1,
        _id: 0
      }
    },
    { $sort: { supplier_count: -1 } }
  ]).toArray();

  const response: ApiResponse<any[]> = {
    success: true,
    data: categories,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export { router as suppliersRouter };