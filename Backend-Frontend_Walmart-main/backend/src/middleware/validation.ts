import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
    return;
  }
  next();
};

// Auth validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .isIn(['supplier', 'walmart_staff', 'customer', 'admin'])
    .withMessage('Invalid role specified'),
  handleValidationErrors
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Product validation rules
export const createProductValidation = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must be less than 200 characters'),
  body('category')
    .isIn(['Electronics', 'Food', 'Clothing', 'Home', 'Health'])
    .withMessage('Invalid category'),
  body('sku')
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU is required and must be less than 50 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  body('sustainability_score')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Sustainability score must be between 0 and 10'),
  body('carbon_footprint')
    .isFloat({ min: 0 })
    .withMessage('Carbon footprint must be a positive number'),
  handleValidationErrors
];

export const updateProductValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be less than 200 characters'),
  body('category')
    .optional()
    .isIn(['Electronics', 'Food', 'Clothing', 'Home', 'Health'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('sustainability_score')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Sustainability score must be between 0 and 10'),
  body('carbon_footprint')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbon footprint must be a positive number'),
  handleValidationErrors
];

// Supplier validation rules
export const createSupplierValidation = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Supplier name is required and must be less than 200 characters'),
  body('location')
    .isLength({ min: 1, max: 500 })
    .withMessage('Location is required and must be less than 500 characters'),
  body('contact_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid contact email is required'),
  body('contact_phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  body('sustainability_score')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Sustainability score must be between 0 and 10'),
  body('certification_level')
    .isIn(['Bronze', 'Silver', 'Gold', 'Platinum'])
    .withMessage('Invalid certification level'),
  body('specialties')
    .isArray()
    .withMessage('Specialties must be an array'),
  body('specialties.*')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each specialty must be between 1 and 100 characters'),
  handleValidationErrors
];

// Tracking validation rules
export const createTrackingEventValidation = [
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  body('location')
    .isLength({ min: 1, max: 500 })
    .withMessage('Location is required and must be less than 500 characters'),
  body('status')
    .isIn(['created', 'in_transit', 'in_warehouse', 'in_store', 'delivered', 'returned'])
    .withMessage('Invalid status'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('temperature')
    .optional()
    .isFloat()
    .withMessage('Temperature must be a number'),
  body('humidity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100'),
  handleValidationErrors
];

// Query validation rules
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort_by')
    .optional()
    .isAlpha()
    .withMessage('Sort field must contain only letters'),
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

export const uuidParamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// QR scan validation
export const qrScanValidation = [
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  body('scan_location')
    .isLength({ min: 1, max: 500 })
    .withMessage('Scan location is required'),
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  handleValidationErrors
];

// Inventory validation
export const inventoryValidation = [
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  body('store_location')
    .isLength({ min: 1, max: 200 })
    .withMessage('Store location is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('reorder_point')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder point must be a non-negative integer'),
  body('max_stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max stock must be a non-negative integer'),
  handleValidationErrors
];