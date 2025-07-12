# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChainTrack is a blockchain-powered supply chain tracking platform built for Walmart. It's a full-stack application with a React frontend, Node.js/Express backend, and MongoDB database integration.

## Common Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Start development server (http://localhost:3001)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run tests
npm test
npm run test:watch

# Lint code
npm run lint

# Database operations
npm run db:seed    # Seed MongoDB with sample data
```

## Architecture Overview

The application follows a modern full-stack architecture:

### Frontend (React + TypeScript + Vite)
- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Routing**: React Router with main routes: `/` (landing), `/dashboard`, `/tracking`, `/analytics`
- **State Management**: Context providers in `src/contexts/` (ThemeContext, AppContext)
- **Styling**: Tailwind CSS with responsive design
- **Components**: Organized in `src/components/` with feature-specific groupings
- **Pages**: Main application pages in `src/pages/`

### Backend (Node.js + Express + TypeScript)
- **Entry Point**: `backend/src/app.ts`
- **Architecture**: RESTful API with WebSocket support (Socket.IO)
- **Database**: MongoDB-only architecture (migrated from PostgreSQL + Redis)
- **Authentication**: JWT-based with role-based access control
- **API Routes**: Organized in `backend/src/routes/` by feature:
  - `/api/auth` - Authentication & user management
  - `/api/products` - Product catalog management
  - `/api/suppliers` - Supplier information & performance
  - `/api/tracking` - QR scanning & supply chain tracking
  - `/api/analytics` - Dashboard metrics & reporting
  - `/api/blockchain` - Blockchain transaction recording

### Key Features
1. **QR Code Scanning Flow**: QR scan → tracking event → blockchain transaction → real-time notification
2. **Real-time Updates**: WebSocket integration for live data updates
3. **Supply Chain Visualization**: Interactive maps and journey tracking
4. **Analytics Dashboard**: Comprehensive metrics and performance data
5. **Multi-role Authentication**: Admin, Walmart staff, supplier, customer roles

## Environment Setup

### Required Environment Variables

**Backend (.env)**:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chaintrack
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend**: No environment variables required for development

### Database Configuration
- **Primary Database**: MongoDB (replaces PostgreSQL + Redis)
- **Collections**: users, products, suppliers, tracking_events, blockchain_transactions, qr_scan_logs, inventory
- **Connection**: Uses mongoose for MongoDB ODM
- **Seeding**: `npm run db:seed` creates sample data including test users

## Development Workflow

### Making Backend Changes
1. Modify files in `backend/src/`
2. TypeScript types are defined in `backend/src/types/index.ts`
3. Database schemas in `backend/src/database/mongoSchema.ts`
4. API validation in `backend/src/middleware/validation.ts`
5. Server auto-restarts with `tsx watch` in development

### Making Frontend Changes
1. Modify files in `src/`
2. Use existing Tailwind classes for styling
3. Follow component patterns in `src/components/`
4. Use context hooks for global state (theme, app state)
5. HMR (Hot Module Replacement) enabled

### API Testing
- Health check: `GET http://localhost:3001/health`
- API documentation: `GET http://localhost:3001/api/docs`
- Test QR scan: `POST http://localhost:3001/api/tracking/scan`

## Deployment Notes

- **MongoDB Migration Complete**: No PostgreSQL/Redis setup required
- **Docker Support**: Dockerfile configurations available in DEPLOYMENT.md
- **Cloud Ready**: Supports MongoDB Atlas, Railway, Vercel deployments
- **Security**: Helmet, CORS, rate limiting, JWT authentication implemented

## Test Credentials

```
Admin: admin@walmart.com / password123
Manager: manager@walmart.com / password123  
Supplier: supplier@apple.com / password123
Customer: customer@example.com / password123
```

## Important Notes

- The backend uses MongoDB exclusively (no PostgreSQL/Redis)
- WebSocket connections available at `ws://localhost:3001`
- QR scanning creates tracking events and blockchain transactions
- Real-time notifications broadcast via WebSocket to subscribed clients
- API includes comprehensive error handling and request validation