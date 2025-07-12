# ChainTrack Backend

A production-ready Node.js backend for ChainTrack - a blockchain-powered supply chain tracking platform for Walmart.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Complete CRUD operations for products with supplier relationships
- **Supply Chain Tracking**: Real-time tracking events and journey visualization
- **Blockchain Integration**: Mock blockchain transaction recording and verification
- **Analytics & Reporting**: Comprehensive dashboards and data export capabilities
- **QR Code Scanning**: Product authentication through QR code scanning
- **Real-time Updates**: WebSocket integration for live data updates
- **AI Predictions**: Integration ready for ML-based demand forecasting
- **Database Support**: PostgreSQL for relational data, MongoDB for analytics

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Databases**: PostgreSQL, MongoDB, Redis
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.IO for WebSocket connections
- **Validation**: express-validator with comprehensive input validation
- **Logging**: Winston with structured logging
- **Security**: Helmet, CORS, rate limiting
- **Blockchain**: Ready for Web3.js/Polygon integration

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- MongoDB 5+
- Redis 6+
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/chaintrack_db
MONGODB_URI=mongodb://localhost:27017/chaintrack
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

```bash
# Run migrations to create tables
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
POST /api/auth/refresh     # Refresh access token
GET  /api/auth/profile     # Get user profile
```

### Product Management

```bash
GET    /api/products              # Get all products (with filtering)
GET    /api/products/:id          # Get product by ID
POST   /api/products              # Create new product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
GET    /api/products/:id/journey  # Get product tracking journey
```

### Supplier Management

```bash
GET    /api/suppliers                    # Get all suppliers
GET    /api/suppliers/:id                # Get supplier by ID
POST   /api/suppliers                    # Create supplier
PUT    /api/suppliers/:id                # Update supplier
GET    /api/suppliers/:id/performance    # Get supplier metrics
POST   /api/suppliers/:id/verify         # Verify supplier
```

### Supply Chain Tracking

```bash
POST /api/tracking/events                          # Create tracking event
GET  /api/tracking/products/:id/events             # Get product events
POST /api/tracking/scan                            # QR code scan
GET  /api/tracking/scans/stats                     # Scan statistics
POST /api/tracking/events/bulk                     # Bulk create events
```

### Analytics & Reporting

```bash
GET  /api/analytics/dashboard        # Dashboard statistics
GET  /api/analytics/supply-chain     # Supply chain metrics
GET  /api/analytics/sustainability   # Sustainability data
GET  /api/analytics/performance      # Performance analytics
POST /api/analytics/export           # Export data
```

### Blockchain Integration

```bash
GET  /api/blockchain/products/:id/transactions    # Product blockchain history
POST /api/blockchain/transactions                 # Create blockchain record
POST /api/blockchain/verify                       # Verify authenticity
GET  /api/blockchain/status                       # Network status
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **admin**: Full system access
- **walmart_staff**: Management operations
- **supplier**: Manage own products
- **customer**: Read-only access for tracking

## 📊 Database Schema

### PostgreSQL Tables

- `users` - User accounts and authentication
- `suppliers` - Supplier information and metrics
- `products` - Product catalog with relationships
- `tracking_events` - Supply chain tracking data
- `inventory` - Stock levels and warehouse data
- `blockchain_transactions` - Blockchain transaction records
- `ai_predictions` - ML prediction results
- `qr_scan_logs` - QR code scan history
- `notification_alerts` - System notifications

### MongoDB Collections

- `ai_predictions` - Machine learning predictions
- `scan_logs` - QR scan analytics
- `blockchain_logs` - Blockchain metadata

## 🔌 WebSocket Events

Connect to `ws://localhost:3001` for real-time updates:

```javascript
// Subscribe to product updates
socket.emit('subscribe_product', 'product-uuid');

// Subscribe to global updates
socket.emit('subscribe_global');

// Listen for events
socket.on('product_update', (data) => {
  console.log('Product updated:', data);
});

socket.on('tracking_update', (data) => {
  console.log('New tracking event:', data);
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t chaintrack-backend .

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://prod_user:password@prod_host:5432/chaintrack_prod
MONGODB_URI=mongodb://prod_mongo:27017/chaintrack_prod
REDIS_URL=redis://prod_redis:6379
JWT_SECRET=your_production_secret_key
CORS_ORIGINS=https://yourdomain.com
```

## 📈 Performance & Monitoring

### Database Optimization

- Comprehensive indexing on frequently queried fields
- Connection pooling for PostgreSQL
- Query optimization with views for complex joins
- Redis caching for frequently accessed data

### Monitoring

```bash
# Health check endpoint
GET /health

# Database health
GET /health/database

# Application metrics
GET /metrics
```

### Logging

Structured logging with Winston:

```bash
# Log files location
logs/chaintrack.log     # Application logs
logs/error.log          # Error logs only
```

## 🔧 Development

### Code Structure

```
src/
├── config/          # Database and logger configuration
├── middleware/      # Authentication, validation, error handling
├── routes/          # API endpoint definitions
├── types/           # TypeScript type definitions
├── database/        # Schema and migration files
└── app.ts          # Main application entry point
```

### Adding New Features

1. Define types in `src/types/index.ts`
2. Create database schema in `src/database/schema.sql`
3. Add validation rules in `src/middleware/validation.ts`
4. Implement routes in `src/routes/`
5. Update API documentation

### Database Migrations

```bash
# Create new migration
npm run db:migrate

# Seed development data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

## 🛡 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation

## 🌐 API Rate Limits

- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **File Upload**: 10 uploads per hour per user

## 📝 Sample API Calls

### Register New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "role": "customer"
  }'
```

### Get Products with Filtering

```bash
curl -X GET "http://localhost:3001/api/products?category=Electronics&page=1&limit=10" \
  -H "Authorization: Bearer <your-token>"
```

### Create Tracking Event

```bash
curl -X POST http://localhost:3001/api/tracking/events \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-uuid",
    "location": "Warehouse A",
    "status": "in_warehouse",
    "description": "Product received at warehouse",
    "coordinates": {"latitude": 40.7128, "longitude": -74.0060}
  }'
```

### QR Code Scan

```bash
curl -X POST http://localhost:3001/api/tracking/scan \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-uuid",
    "scan_location": "New York Store #123",
    "coordinates": {"latitude": 40.7128, "longitude": -74.0060}
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- 📧 Email: support@chaintrack.com
- 📚 Documentation: `/api/docs`
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Built with ❤️ for Walmart Hackathon 2024**