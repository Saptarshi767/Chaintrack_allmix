import { getMongoDB } from '../config/database.js';
import { createMongoIndexes } from './mongoSchema.js';
import { logger } from '../config/logger.js';

export const runMigrations = async (): Promise<void> => {
  try {
    logger.info('Starting MongoDB schema setup...');

    // Connect to MongoDB and create indexes
    const db = getMongoDB();
    await createMongoIndexes();

    logger.info('MongoDB schema setup completed successfully');
  } catch (error) {
    logger.error('MongoDB schema setup failed:', error);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}