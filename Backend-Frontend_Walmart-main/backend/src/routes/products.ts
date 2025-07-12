import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMongoDB } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  createProductValidation,
  updateProductValidation,
  uuidParamValidation,
  paginationValidation
} from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest, ApiResponse, Product, ProductFilters } from '../types/index.js';

const router = Router();

// Get all products with filtering and pagination
router.get('/', paginationValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = 1,
    limit = 20,
    category,
    supplier_id,
    search,
    min_price,
    max_price,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query as ProductFilters;

  let whereClause = 'WHERE p.is_active = true';
  const queryParams: any[] = [];
  let paramCount = 0;

  // Build dynamic WHERE clause
  if (category) {
    paramCount++;
    whereClause += ` AND p.category = $${paramCount}`;
    queryParams.push(category);
  }

  if (supplier_id) {
    paramCount++;
    whereClause += ` AND p.supplier_id = $${paramCount}`;
    queryParams.push(supplier_id);
  }

  if (search) {
    paramCount++;
    whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
    queryParams.push(`%${search}%`);
  }

  if (min_price) {
    paramCount++;
    whereClause += ` AND p.price >= $${paramCount}`;
    queryParams.push(min_price);
  }

  if (max_price) {
    paramCount++;
    whereClause += ` AND p.price <= $${paramCount}`;
    queryParams.push(max_price);
  }

  // Validate sort field
  const allowedSortFields = ['name', 'price', 'created_at', 'sustainability_score', 'category'];
  const sortField = allowedSortFields.includes(sort_by as string) ? sort_by : 'created_at';
  const orderDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

  // Calculate offset
  const offset = ((page as number) - 1) * (limit as number);
  paramCount += 2;
  const limitParam = paramCount - 1;
  const offsetParam = paramCount;
  queryParams.push(limit, offset);

  // Main query with supplier information
  const query = `
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
    ${whereClause}
    ORDER BY p.${sortField} ${orderDirection}
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    ${whereClause}
  `;

  const db = getMongoDB();

  // Build MongoDB filter
  const filter: any = { is_active: true };
  
  if (category) filter.category = category;
  if (supplier_id) filter.supplier_id = supplier_id;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }
  if (min_price) filter.price = { ...filter.price, $gte: parseFloat(min_price as string) };
  if (max_price) filter.price = { ...filter.price, $lte: parseFloat(max_price as string) };

  // Build sort object
  const sortObj: any = {};
  sortObj[sortField as string] = sort_order === 'asc' ? 1 : -1;

  const skip = ((page as number) - 1) * (limit as number);

  const [products, total] = await Promise.all([
    db.collection('products').aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier_id',
          foreignField: 'id',
          as: 'supplier_info'
        }
      },
      {
        $lookup: {
          from: 'tracking_events',
          localField: 'id',
          foreignField: 'product_id',
          as: 'tracking_events'
        }
      },
      {
        $addFields: {
          supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] },
          supplier_location: { $arrayElemAt: ['$supplier_info.location', 0] },
          supplier_sustainability: { $arrayElemAt: ['$supplier_info.sustainability_score', 0] },
          supplier_verified: { $arrayElemAt: ['$supplier_info.verified', 0] },
          tracking_events_count: { $size: '$tracking_events' },
          current_status: {
            $arrayElemAt: [
              {
                $map: {
                  input: { $slice: [{ $sortArray: { input: '$tracking_events', sortBy: { timestamp: -1 } } }, 1] },
                  in: '$$this.status'
                }
              },
              0
            ]
          },
          current_location: {
            $arrayElemAt: [
              {
                $map: {
                  input: { $slice: [{ $sortArray: { input: '$tracking_events', sortBy: { timestamp: -1 } } }, 1] },
                  in: '$$this.location'
                }
              },
              0
            ]
          }
        }
      },
      { $unset: ['supplier_info', 'tracking_events'] },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit as number }
    ]).toArray(),
    db.collection('products').countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / (limit as number));

  const response: ApiResponse<{
    products: Product[];
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
      products,
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

// Get single product by ID
router.get('/:id', uuidParamValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const db = getMongoDB();

  const product = await db.collection('products').aggregate([
    { $match: { id, is_active: true } },
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
        supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] },
        supplier_location: { $arrayElemAt: ['$supplier_info.location', 0] },
        supplier_email: { $arrayElemAt: ['$supplier_info.contact_email', 0] },
        supplier_sustainability: { $arrayElemAt: ['$supplier_info.sustainability_score', 0] },
        supplier_verified: { $arrayElemAt: ['$supplier_info.verified', 0] },
        supplier_certification: { $arrayElemAt: ['$supplier_info.certification_level', 0] }
      }
    },
    { $unset: ['supplier_info'] }
  ]).toArray();

  if (product.length === 0) {
    throw new AppError('Product not found', 404);
  }

  const productData = product[0];

  const response: ApiResponse<Product> = {
    success: true,
    data: productData,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Create new product
router.post('/',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff', 'supplier'),
  createProductValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      category,
      sku,
      description,
      price,
      weight,
      dimensions,
      sustainability_score,
      carbon_footprint
    } = req.body;

    // For suppliers, use their own supplier_id
    let supplierId = req.body.supplier_id;
    if (req.user?.role === 'supplier') {
      if (!req.user.supplier_id) {
        throw new AppError('Supplier user must have supplier_id associated', 400);
      }
      supplierId = req.user.supplier_id;
    }

    if (!supplierId) {
      throw new AppError('Supplier ID is required', 400);
    }

    const db = getMongoDB();

    // Verify supplier exists
    const supplier = await db.collection('suppliers').findOne({ 
      id: supplierId, 
      is_active: true 
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Check if SKU already exists
    const existingSku = await db.collection('products').findOne({ sku });

    if (existingSku) {
      throw new AppError('Product with this SKU already exists', 409);
    }

    const productId = uuidv4();
    const product = {
      id: productId,
      name,
      category,
      supplier_id: supplierId,
      sku,
      description,
      price,
      weight,
      dimensions,
      sustainability_score,
      carbon_footprint,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('products').insertOne(product);

    logger.info('Product created', {
      productId: product.id,
      sku: product.sku,
      createdBy: req.user?.id,
      supplierId
    });

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
      message: 'Product created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  })
);

// Update product
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff', 'supplier'),
  updateProductValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updateFields = req.body;

    const db = getMongoDB();

    // Check if product exists
    const existingProduct = await db.collection('products').findOne({
      id,
      is_active: true
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    const product = existingProduct;

    // For suppliers, only allow updating their own products
    if (req.user?.role === 'supplier') {
      if (product.supplier_id !== req.user.supplier_id) {
        throw new AppError('You can only update your own products', 403);
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

    const result = await db.collection('products').findOneAndUpdate(
      { id, is_active: true },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    const updatedProduct = result;

    logger.info('Product updated', {
      productId: id,
      updatedBy: req.user?.id,
      fieldsUpdated: Object.keys(updateFields)
    });

    const response: ApiResponse<Product> = {
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Delete product (soft delete)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff'),
  uuidParamValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const db = getMongoDB();

    const result = await db.collection('products').findOneAndUpdate(
      { id, is_active: true },
      { $set: { is_active: false, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Product not found', 404);
    }

    const product = result;

    logger.info('Product deleted', {
      productId: id,
      productName: product.name,
      sku: product.sku,
      deletedBy: req.user?.id
    });

    const response: ApiResponse = {
      success: true,
      message: 'Product deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Get product journey/tracking history
router.get('/:id/journey', uuidParamValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const db = getMongoDB();

  // Verify product exists
  const product = await db.collection('products').findOne({ 
    id, 
    is_active: true 
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Get tracking events
  const journey = await db.collection('tracking_events').aggregate([
    { $match: { product_id: id } },
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
        scanned_by_name: { $arrayElemAt: ['$scanned_by_info.name', 0] }
      }
    },
    { $unset: ['scanned_by_info'] },
    { $sort: { timestamp: 1 } }
  ]).toArray();

  const response: ApiResponse<{
    product: { id: string; name: string };
    journey: any[];
  }> = {
    success: true,
    data: {
      product: { id: product.id, name: product.name },
      journey
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get products by supplier
router.get('/supplier/:supplierId',
  uuidParamValidation,
  paginationValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { supplierId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = ((page as number) - 1) * (limit as number);

    const db = getMongoDB();
    const skip = ((page as number) - 1) * (limit as number);

    const [products, total] = await Promise.all([
      db.collection('products').aggregate([
        { $match: { supplier_id: supplierId, is_active: true } },
        {
          $lookup: {
            from: 'tracking_events',
            localField: 'id',
            foreignField: 'product_id',
            as: 'tracking_events'
          }
        },
        {
          $addFields: {
            tracking_events_count: { $size: '$tracking_events' }
          }
        },
        { $unset: ['tracking_events'] },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit as number }
      ]).toArray(),
      db.collection('products').countDocuments({ supplier_id: supplierId, is_active: true })
    ]);

    const totalPages = Math.ceil(total / (limit as number));

    const response: ApiResponse<{
      products: Product[];
      pagination: any;
    }> = {
      success: true,
      data: {
        products,
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

export { router as productsRouter };