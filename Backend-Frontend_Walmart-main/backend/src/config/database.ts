import { MongoClient, Db } from 'mongodb';
import { logger } from './logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaintrack';

// MongoDB Connection
let mongoDb: Db;
let mongoClient: MongoClient;

export const connectMongoDB = async (): Promise<Db> => {
  try {
    if (mongoDb) return mongoDb;
    
    logger.info('Attempting to connect to MongoDB...', { uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') });
    
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db('chaintrack'); // Explicitly specify database name
    
    logger.info('MongoDB connected successfully to database: chaintrack');
    return mongoDb;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const getMongoDB = (): Db => {
  if (!mongoDb) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return mongoDb;
};


// Database initialization
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeConnections = async (): Promise<void> => {
  try {
    if (mongoClient) {
      await mongoClient.close();
    }
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<{
  mongodb: boolean;
}> => {
  const health = {
    mongodb: false,
  };

  try {
    await getMongoDB().admin().ping();
    health.mongodb = true;
  } catch (error) {
    logger.warn('MongoDB health check failed:', error);
  }

  return health;
};