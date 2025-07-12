import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getMongoDB } from '../config/database.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';
import { ApiResponse, User } from '../types/index.js';

const router = Router();

// Register new user
router.post('/register', registerValidation, asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role, supplier_id } = req.body;
  const db = getMongoDB();

  // Check if user already exists
  const existingUser = await db.collection('users').findOne({ email });

  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const userId = uuidv4();
  const newUser = {
    id: userId,
    email,
    password_hash: passwordHash,
    name,
    role,
    supplier_id: supplier_id || null,
    created_at: new Date(),
    updated_at: new Date(),
    last_login: null,
    is_active: true
  };

  await db.collection('users').insertOne(newUser);

  // Generate tokens
  const tokenPayload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    supplier_id: newUser.supplier_id
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  logger.info('User registered successfully', {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role
  });

  const response: ApiResponse<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> = {
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        supplier_id: newUser.supplier_id,
        created_at: newUser.created_at
      },
      access_token: accessToken,
      refresh_token: refreshToken
    },
    message: 'User registered successfully',
    timestamp: new Date().toISOString()
  };

  res.status(201).json(response);
}));

// Login user
router.post('/login', loginValidation, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = getMongoDB();

  // Find user
  const user = await db.collection('users').findOne({ email });

  if (!user || !user.is_active) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  await db.collection('users').updateOne(
    { id: user.id },
    { 
      $set: { 
        last_login: new Date(),
        updated_at: new Date()
      }
    }
  );

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    supplier_id: user.supplier_id
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    role: user.role
  });

  const response: ApiResponse<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        supplier_id: user.supplier_id
      },
      access_token: accessToken,
      refresh_token: refreshToken
    },
    message: 'Login successful',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  const db = getMongoDB();

  if (!refresh_token) {
    throw new AppError('Refresh token is required', 400);
  }

  const decoded = verifyRefreshToken(refresh_token);
  if (!decoded) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Verify user still exists and is active
  const user = await db.collection('users').findOne({ 
    id: decoded.id, 
    is_active: true 
  });

  if (!user) {
    throw new AppError('User not found or inactive', 401);
  }

  // Generate new tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    supplier_id: user.supplier_id
  };

  const accessToken = generateToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const response: ApiResponse<{
    access_token: string;
    refresh_token: string;
  }> = {
    success: true,
    data: {
      access_token: accessToken,
      refresh_token: newRefreshToken
    },
    message: 'Token refreshed successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get current user profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  // This endpoint would use the authenticateToken middleware
  // For now, we'll add a placeholder
  const response: ApiResponse = {
    success: true,
    message: 'Profile endpoint - requires authentication middleware',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Change password
router.put('/change-password', asyncHandler(async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (new_password.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400);
  }

  // This would require authentication middleware to get user ID
  // Placeholder response for now
  const response: ApiResponse = {
    success: true,
    message: 'Change password endpoint - requires authentication middleware',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Logout (invalidate token - could be implemented with redis blacklist)
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // In a full implementation, you might want to blacklist the token
  // For now, client-side token removal is sufficient
  
  logger.info('User logout request');

  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export { router as authRouter };