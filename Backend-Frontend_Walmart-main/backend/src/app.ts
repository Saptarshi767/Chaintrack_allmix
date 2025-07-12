import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

// Import configurations
import { initializeDatabase, closeConnections, checkDatabaseHealth } from './config/database.js';
import { logger, requestLogger } from './config/logger.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { suppliersRouter } from './routes/suppliers.js';
import { trackingRouter } from './routes/tracking.js';
import { analyticsRouter } from './routes/analytics.js';
import { blockchainRouter } from './routes/blockchain.js';

// Import types
import { WebSocketMessage } from './types/index.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const overallHealth = dbHealth.mongodb;

    res.status(overallHealth ? 200 : 503).json({
      success: overallHealth,
      timestamp: new Date().toISOString(),
      service: 'chaintrack-backend',
      version: '1.0.0',
      environment: NODE_ENV,
      mongodb: dbHealth.mongodb,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/blockchain', blockchainRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ChainTrack Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'ChainTrack API Documentation',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/logout': 'User logout'
      },
      products: {
        'GET /api/products': 'Get all products (with filtering)',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product',
        'DELETE /api/products/:id': 'Delete product',
        'GET /api/products/:id/journey': 'Get product tracking journey',
        'GET /api/products/supplier/:supplierId': 'Get products by supplier'
      },
      suppliers: {
        'GET /api/suppliers': 'Get all suppliers (with filtering)',
        'GET /api/suppliers/:id': 'Get supplier by ID',
        'POST /api/suppliers': 'Create new supplier',
        'PUT /api/suppliers/:id': 'Update supplier',
        'DELETE /api/suppliers/:id': 'Delete supplier',
        'GET /api/suppliers/:id/performance': 'Get supplier performance metrics',
        'POST /api/suppliers/:id/verify': 'Verify supplier',
        'GET /api/suppliers/stats/categories': 'Get supplier category statistics'
      },
      tracking: {
        'POST /api/tracking/events': 'Create tracking event',
        'GET /api/tracking/products/:productId/events': 'Get product tracking events',
        'GET /api/tracking/events/recent': 'Get recent tracking events',
        'PUT /api/tracking/events/:id/location': 'Update tracking event location',
        'POST /api/tracking/scan': 'QR code scan',
        'GET /api/tracking/scans/stats': 'Get scan statistics',
        'GET /api/tracking/locations/:location/events': 'Get events by location',
        'POST /api/tracking/events/bulk': 'Bulk create tracking events'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Get dashboard statistics',
        'GET /api/analytics/supply-chain': 'Get supply chain metrics',
        'GET /api/analytics/sustainability': 'Get sustainability metrics',
        'GET /api/analytics/performance': 'Get performance analytics',
        'GET /api/analytics/predictions': 'Get AI predictions summary',
        'POST /api/analytics/export': 'Export data'
      },
      blockchain: {
        'GET /api/blockchain/products/:productId/transactions': 'Get product blockchain transactions',
        'POST /api/blockchain/transactions': 'Create blockchain transaction',
        'GET /api/blockchain/transactions/:hash': 'Get transaction by hash',
        'POST /api/blockchain/verify': 'Verify product authenticity',
        'GET /api/blockchain/status': 'Get blockchain network status',
        'GET /api/blockchain/transactions': 'Get recent transactions',
        'POST /api/blockchain/contract/interact': 'Smart contract interaction'
      }
    },
    websocket: {
      events: {
        'product_update': 'Product information updated',
        'tracking_update': 'New tracking event added',
        'prediction_update': 'AI prediction generated',
        'alert': 'System alert/notification'
      },
      rooms: {
        'product_{id}': 'Subscribe to specific product updates',
        'supplier_{id}': 'Subscribe to specific supplier updates',
        'global': 'Subscribe to global system updates'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  // Subscribe to product updates
  socket.on('subscribe_product', (productId: string) => {
    socket.join(`product_${productId}`);
    logger.info('Client subscribed to product updates', { socketId: socket.id, productId });
  });

  // Subscribe to supplier updates
  socket.on('subscribe_supplier', (supplierId: string) => {
    socket.join(`supplier_${supplierId}`);
    logger.info('Client subscribed to supplier updates', { socketId: socket.id, supplierId });
  });

  // Subscribe to global updates
  socket.on('subscribe_global', () => {
    socket.join('global');
    logger.info('Client subscribed to global updates', { socketId: socket.id });
  });

  // Unsubscribe from updates
  socket.on('unsubscribe', (room: string) => {
    socket.leave(room);
    logger.info('Client unsubscribed from room', { socketId: socket.id, room });
  });

  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    logger.info('WebSocket client disconnected', { socketId: socket.id, reason });
  });

  // Send welcome message
  socket.emit('connected', {
    success: true,
    message: 'Connected to ChainTrack WebSocket',
    timestamp: new Date().toISOString()
  });
});

// WebSocket utility functions
const broadcastToRoom = (room: string, message: WebSocketMessage): void => {
  io.to(room).emit(message.type, message);
  logger.debug('Message broadcasted to room', { room, messageType: message.type });
};

const broadcastGlobal = (message: WebSocketMessage): void => {
  io.to('global').emit(message.type, message);
  logger.debug('Global message broadcasted', { messageType: message.type });
};

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
  });

  io.close(() => {
    logger.info('WebSocket server closed');
  });

  try {
    await closeConnections();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }

  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connections
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Start the server
    server.listen(PORT, () => {
      logger.info(`ChainTrack Backend started successfully`, {
        port: PORT,
        environment: NODE_ENV,
        pid: process.pid,
        nodeVersion: process.version
      });

      if (NODE_ENV === 'development') {
        console.log(`
🚀 ChainTrack Backend is running!

📍 Server: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/health
📚 Docs: http://localhost:${PORT}/api/docs
🔌 WebSocket: ws://localhost:${PORT}

Environment: ${NODE_ENV}
Process ID: ${process.pid}
Node Version: ${process.version}
        `);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export { app, io, broadcastToRoom, broadcastGlobal };