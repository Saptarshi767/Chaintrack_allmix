import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMongoDB } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { uuidParamValidation, paginationValidation } from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest, ApiResponse, BlockchainTransaction } from '../types/index.js';

const router = Router();

// Note: This is a mock implementation. In production, you would integrate with actual blockchain networks
// using libraries like web3.js or ethers.js for Ethereum/Polygon integration

// Get blockchain transactions for a product
router.get('/products/:productId/transactions',
  uuidParamValidation,
  paginationValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;

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

    const [transactions, total] = await Promise.all([
      db.collection('blockchain_transactions').aggregate([
        { $match: { product_id: productId } },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: 'id',
            as: 'product_info'
          }
        },
        {
          $addFields: {
            product_name: { $arrayElemAt: ['$product_info.name', 0] },
            product_sku: { $arrayElemAt: ['$product_info.sku', 0] }
          }
        },
        { $unset: ['product_info'] },
        { $sort: { timestamp: -1 } },
        { $skip: skip },
        { $limit: limit as number }
      ]).toArray(),
      db.collection('blockchain_transactions').countDocuments({ product_id: productId })
    ]);

    const totalPages = Math.ceil(total / (limit as number));

    const response: ApiResponse<{
      product: { id: string; name: string };
      transactions: BlockchainTransaction[];
      pagination: any;
    }> = {
      success: true,
      data: {
        product: { id: product.id, name: product.name },
        transactions,
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

// Create blockchain transaction record
router.post('/transactions',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff', 'supplier'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      product_id,
      action,
      from_address,
      to_address,
      blockchain_hash,
      metadata
    } = req.body;

    if (!product_id || !action || !from_address || !to_address) {
      throw new AppError('Product ID, action, from_address, and to_address are required', 400);
    }

    const db = getMongoDB();

    // Verify product exists
    const product = await db.collection('products').findOne({ 
      id: product_id, 
      is_active: true 
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // In a real implementation, you would:
    // 1. Call the actual blockchain network
    // 2. Submit the transaction
    // 3. Get the transaction hash
    // 4. Monitor for confirmation

    // Mock blockchain transaction
    const transactionHash = blockchain_hash || generateMockTransactionHash();
    const transactionId = uuidv4();

    const transaction = {
      id: transactionId,
      transaction_hash: transactionHash,
      block_number: null, // Will be set when confirmed
      product_id,
      action,
      from_address,
      to_address,
      gas_used: 21000, // Mock gas used
      gas_price: '20000000000', // Mock gas price (20 gwei)
      status: 'pending', // Initially pending
      metadata,
      timestamp: new Date()
    };

    await db.collection('blockchain_transactions').insertOne(transaction);

    // Simulate blockchain confirmation after a delay (in production, this would be event-driven)
    setTimeout(async () => {
      try {
        await db.collection('blockchain_transactions').updateOne(
          { id: transactionId },
          { 
            $set: { 
              status: 'confirmed', 
              block_number: 18500000 + Math.floor(Math.random() * 1000) 
            } 
          }
        );

        logger.info('Blockchain transaction confirmed', {
          transactionId,
          transactionHash,
          productId: product_id
        });
      } catch (error) {
        logger.error('Failed to confirm blockchain transaction', { error, transactionId });
      }
    }, 2000);

    logger.info('Blockchain transaction created', {
      transactionId,
      transactionHash,
      productId: product_id,
      action,
      createdBy: req.user?.id
    });

    const response: ApiResponse<BlockchainTransaction> = {
      success: true,
      data: transaction,
      message: 'Blockchain transaction submitted successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  })
);

// Get transaction by hash
router.get('/transactions/:hash',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { hash } = req.params;

    const db = getMongoDB();

    const transaction = await db.collection('blockchain_transactions').aggregate([
      { $match: { transaction_hash: hash } },
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
          product_sku: { $arrayElemAt: ['$product_info.sku', 0] },
          supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] }
        }
      },
      { $unset: ['product_info', 'supplier_info'] }
    ]).toArray();

    if (transaction.length === 0) {
      throw new AppError('Transaction not found', 404);
    }

    const transactionData = transaction[0];

    const response: ApiResponse<BlockchainTransaction> = {
      success: true,
      data: transactionData,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Verify product authenticity on blockchain
router.post('/verify',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { product_id, transaction_hash } = req.body;

    if (!product_id && !transaction_hash) {
      throw new AppError('Either product_id or transaction_hash is required', 400);
    }

    let verificationQuery;
    let queryParams;

    const db = getMongoDB();

    let verificationPipeline;
    
    if (transaction_hash) {
      verificationPipeline = [
        { $match: { transaction_hash, status: 'confirmed' } }
      ];
    } else {
      verificationPipeline = [
        { $match: { product_id, status: 'confirmed' } },
        { $sort: { timestamp: -1 } },
        { $limit: 1 }
      ];
    }

    verificationPipeline.push(
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
          product_sku: { $arrayElemAt: ['$product_info.sku', 0] },
          supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] },
          supplier_verified: { $arrayElemAt: ['$supplier_info.verified', 0] }
        }
      },
      { $unset: ['product_info', 'supplier_info'] }
    );

    const result = await db.collection('blockchain_transactions').aggregate(verificationPipeline).toArray();

    if (result.length === 0) {
      const response: ApiResponse<any> = {
        success: false,
        data: {
          verified: false,
          reason: 'No confirmed blockchain transactions found for this product'
        },
        message: 'Product verification failed',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    const transaction = result[0];

    // In a real implementation, you would:
    // 1. Query the actual blockchain network
    // 2. Verify transaction exists and is confirmed
    // 3. Validate smart contract state
    // 4. Check digital signatures

    const isVerified = transaction.status === 'confirmed' && transaction.supplier_verified;

    const response: ApiResponse<any> = {
      success: true,
      data: {
        verified: isVerified,
        transaction: {
          hash: transaction.transaction_hash,
          block_number: transaction.block_number,
          timestamp: transaction.timestamp,
          status: transaction.status
        },
        product: {
          id: transaction.product_id,
          name: transaction.product_name,
          sku: transaction.product_sku
        },
        supplier: {
          name: transaction.supplier_name,
          verified: transaction.supplier_verified
        },
        verification_details: {
          blockchain_verified: transaction.status === 'confirmed',
          supplier_verified: transaction.supplier_verified,
          authenticity_score: isVerified ? 100 : 75
        }
      },
      message: isVerified ? 'Product authenticity verified' : 'Product verification incomplete',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Get blockchain network status
router.get('/status',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // In a real implementation, you would query the actual blockchain network
    // This is a mock implementation

    const db = getMongoDB();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stats = await db.collection('blockchain_transactions').aggregate([
      { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
      {
        $group: {
          _id: null,
          total_transactions: { $sum: 1 },
          confirmed_transactions: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pending_transactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failed_transactions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          avg_gas_used: { $avg: '$gas_used' },
          products_on_chain: { $addToSet: '$product_id' }
        }
      },
      {
        $addFields: {
          products_on_chain: { $size: '$products_on_chain' }
        }
      }
    ]).toArray();

    const networkStats = stats[0] || {
      total_transactions: 0,
      confirmed_transactions: 0,
      pending_transactions: 0,
      failed_transactions: 0,
      avg_gas_used: 0,
      products_on_chain: 0
    };

    const response: ApiResponse<any> = {
      success: true,
      data: {
        network: {
          name: 'Polygon Mumbai Testnet',
          chain_id: 80001,
          status: 'online',
          last_block: 18500000 + Math.floor(Math.random() * 1000),
          average_block_time: '2.1s',
          gas_price: '20 gwei'
        },
        contract: {
          address: process.env.CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
          status: 'deployed',
          version: '1.0.0'
        },
        statistics: {
          total_transactions_24h: networkStats.total_transactions,
          confirmed_transactions_24h: networkStats.confirmed_transactions,
          pending_transactions: networkStats.pending_transactions,
          failed_transactions_24h: networkStats.failed_transactions,
          average_gas_used: networkStats.avg_gas_used || 0,
          products_on_chain: networkStats.products_on_chain,
          success_rate: networkStats.total_transactions > 0 ? 
            (networkStats.confirmed_transactions / networkStats.total_transactions * 100).toFixed(2) + '%' : '0%'
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Get recent blockchain transactions
router.get('/transactions',
  paginationValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, status } = req.query;

    const db = getMongoDB();

    // Build MongoDB filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const skip = ((page as number) - 1) * (limit as number);

    const [transactions, total] = await Promise.all([
      db.collection('blockchain_transactions').aggregate([
        { $match: filter },
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
            product_sku: { $arrayElemAt: ['$product_info.sku', 0] },
            supplier_name: { $arrayElemAt: ['$supplier_info.name', 0] }
          }
        },
        { $unset: ['product_info', 'supplier_info'] },
        { $sort: { timestamp: -1 } },
        { $skip: skip },
        { $limit: limit as number }
      ]).toArray(),
      db.collection('blockchain_transactions').countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / (limit as number));

    const response: ApiResponse<{
      transactions: BlockchainTransaction[];
      pagination: any;
    }> = {
      success: true,
      data: {
        transactions,
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

// Smart contract interaction endpoint (mock)
router.post('/contract/interact',
  authenticateToken,
  authorizeRoles('admin', 'walmart_staff'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { method, parameters } = req.body;

    if (!method) {
      throw new AppError('Contract method is required', 400);
    }

    // This is a mock implementation
    // In production, you would use web3.js or ethers.js to interact with smart contracts

    const mockResponse = {
      method,
      parameters: parameters || {},
      transaction_hash: generateMockTransactionHash(),
      gas_estimate: 45000,
      status: 'pending',
      estimated_confirmation_time: '30 seconds'
    };

    logger.info('Smart contract interaction', {
      method,
      parameters,
      userId: req.user?.id
    });

    const response: ApiResponse<any> = {
      success: true,
      data: mockResponse,
      message: 'Smart contract interaction submitted',
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

export { router as blockchainRouter };