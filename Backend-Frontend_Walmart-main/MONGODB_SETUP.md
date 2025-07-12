# 🚀 ChainTrack MongoDB Setup Guide

## ✅ Migration Complete!

The backend has been successfully migrated from PostgreSQL + Redis to **MongoDB-only** architecture.

## 📋 Quick Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

### 2. Configure Environment
Edit `backend/.env` file:
```env
# Replace with your actual MongoDB credentials
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.l3vntdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Set a secure JWT secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random

# Other settings (can keep defaults)
PORT=3001
NODE_ENV=development
```

### 3. Seed Database with Sample Data
```bash
cd backend
npm run db:seed
```

### 4. Start Backend Server
```bash
npm run dev
```

✅ **Backend running at: http://localhost:3001**

### 5. Frontend Setup (in separate terminal)
```bash
cd .. # back to root directory
npm install
npm run dev
```

✅ **Frontend running at: http://localhost:5173**

## 🔥 Key Features Implemented

### QR Scan → Blockchain Flow
1. **QR Code Scan** → Stores in `qr_scan_logs` collection
2. **Tracking Event** → Stores in `tracking_events` collection  
3. **Blockchain Transaction** → Stores in `blockchain_transactions` collection
4. **Real-time Notification** → WebSocket broadcast

### Test the QR Scan Flow:
```bash
# Test QR scan endpoint
curl -X POST http://localhost:3001/api/tracking/scan \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-uuid-from-seeded-data",
    "scan_location": "Test Store Location",
    "coordinates": {"latitude": 40.7128, "longitude": -74.0060}
  }'
```

## 📊 MongoDB Collections Created

1. **users** - Authentication and user management
2. **suppliers** - Supplier information and metrics  
3. **products** - Product catalog
4. **tracking_events** - Supply chain tracking (QR scans)
5. **blockchain_transactions** - Blockchain records
6. **qr_scan_logs** - QR scan history and analytics
7. **inventory** - Stock management

## 🧪 Test Login Credentials

```
Admin User:
Email: admin@walmart.com
Password: password123

Manager:
Email: manager@walmart.com  
Password: password123

Supplier:
Email: supplier@apple.com
Password: password123

Customer:
Email: customer@example.com
Password: password123
```

## 📡 API Endpoints Working

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **QR Scanning**: `POST /api/tracking/scan` ⭐ **KEY FEATURE**
- **Products**: `GET /api/products`, `POST /api/products`
- **Tracking**: `GET /api/tracking/events/recent`
- **Blockchain**: `GET /api/blockchain/transactions`
- **Health Check**: `GET /api/health`

## 🔧 What's Different

### ✅ Removed:
- PostgreSQL dependency
- Redis dependency  
- Complex SQL queries
- AI/ML prediction components (as requested)

### ✅ Added:
- MongoDB-only architecture
- Simplified setup (no PostgreSQL installation needed)
- MongoDB Atlas cloud connection
- Streamlined QR scan → blockchain flow
- Better performance with NoSQL queries

## 🎯 Next Steps for Smart Contract Integration

1. Update `CONTRACT_ADDRESS` in `.env` when you deploy smart contract
2. Implement actual blockchain calls in `src/routes/blockchain.ts`
3. Replace mock transaction hashes with real ones
4. Add Web3.js integration for Polygon network

## 🆘 Troubleshooting

### MongoDB Connection Issues:
- Verify your MongoDB Atlas credentials
- Check network access in MongoDB Atlas (whitelist your IP)
- Ensure cluster is active

### Port Issues:
```bash
# Kill processes on ports if needed
sudo lsof -ti:3001 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

**That's it! Your ChainTrack backend is now running on MongoDB and ready for QR scan testing! 🎉**