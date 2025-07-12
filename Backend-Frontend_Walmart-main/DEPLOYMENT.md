# ChainTrack Deployment Guide

Complete deployment guide for ChainTrack supply chain tracking platform.

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Databases     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Postgres)    │
│   Port: 5173    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    │   (MongoDB)     │
                                              │   Port: 27017   │
                                              │   (Redis)       │
                                              │   Port: 6379    │
                                              └─────────────────┘
```

## 🚀 Quick Deployment (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- MongoDB 5+
- Redis 6+
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd Walmart-Hack
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/chaintrack_db
MONGODB_URI=mongodb://localhost:27017/chaintrack
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb chaintrack_db

# Run migrations and seed data
npm run db:migrate
npm run db:seed
```

### 4. Start Backend
```bash
npm run dev
```

Backend will be available at `http://localhost:3001`

### 5. Frontend Setup
```bash
cd ../  # Back to root directory
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: chaintrack_db
      POSTGRES_USER: chaintrack_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chaintrack_user -d chaintrack_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MongoDB Database
  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_DATABASE: chaintrack
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/chaintrack --quiet
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://chaintrack_user:secure_password@postgres:5432/chaintrack_db
      MONGODB_URI: mongodb://mongodb:27017/chaintrack
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your_production_secret_key_here
      PORT: 3001
      NODE_ENV: production
      FRONTEND_URL: http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Application
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      VITE_API_URL: http://localhost:3001

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
```

### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chaintrack -u 1001

# Copy built application
COPY --from=builder --chown=chaintrack:nodejs /app/dist ./dist
COPY --from=builder --chown=chaintrack:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=chaintrack:nodejs /app/package.json ./package.json

# Create logs directory
RUN mkdir -p logs && chown chaintrack:nodejs logs

USER chaintrack

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
```

### Frontend Dockerfile

Create `Dockerfile.frontend`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### Railway Deployment

1. **Create Railway Project**
```bash
npm install -g @railway/cli
railway login
railway init
```

2. **Add Environment Variables**
```bash
railway variables set DATABASE_URL=<postgres-url>
railway variables set MONGODB_URI=<mongodb-url>
railway variables set REDIS_URL=<redis-url>
railway variables set JWT_SECRET=<secret>
railway variables set NODE_ENV=production
```

3. **Deploy Backend**
```bash
cd backend
railway up
```

4. **Deploy Frontend**
```bash
cd ../
railway up --service frontend
```

### Vercel Deployment (Frontend Only)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-url.com"
  }
}
```

3. **Deploy**
```bash
npm run build
vercel --prod
```

### Google Cloud Platform

1. **Create GCP Project**
```bash
gcloud projects create chaintrack-prod
gcloud config set project chaintrack-prod
```

2. **Enable Services**
```bash
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

3. **Deploy to Cloud Run**
```bash
# Build and submit image
gcloud builds submit --tag gcr.io/chaintrack-prod/backend backend/

# Deploy to Cloud Run
gcloud run deploy chaintrack-backend \
  --image gcr.io/chaintrack-prod/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### AWS Deployment

1. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name chaintrack-cluster
```

2. **Create Task Definition**
```json
{
  "family": "chaintrack-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "chaintrack-backend",
      "image": "your-ecr-repo/chaintrack-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Backend (.env)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/chaintrack_prod
MONGODB_URI=mongodb://host:27017/chaintrack_prod
REDIS_URL=redis://host:6379
JWT_SECRET=super_secure_random_string_min_32_chars
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/chaintrack.log

# Blockchain (when integrated)
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your-key
PRIVATE_KEY=your_ethereum_private_key
CONTRACT_ADDRESS=0x...

# External APIs
WEATHER_API_KEY=your_openweather_key
NEWS_API_KEY=your_news_api_key
```

### Frontend Environment Variables

```env
# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_APP_NAME=ChainTrack
VITE_APP_VERSION=1.0.0
```

## 🔒 Security Configuration

### SSL/TLS Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/chaintrack
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/chaintrack/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'chaintrack-backend',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Database Monitoring

```sql
-- PostgreSQL monitoring queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del 
FROM pg_stat_user_tables;

-- Create monitoring user
CREATE USER monitoring WITH PASSWORD 'monitor_pass';
GRANT CONNECT ON DATABASE chaintrack_db TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;
```

### Log Aggregation

```bash
# Install and configure Logrotate
sudo nano /etc/logrotate.d/chaintrack

/var/www/chaintrack/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reload chaintrack-backend
    endscript
}
```

## 🚦 Health Checks & Alerts

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/health/database

# Application metrics
curl http://localhost:3001/metrics
```

### Monitoring Script

Create `monitoring/health-check.sh`:
```bash
#!/bin/bash

BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Check backend health
if curl -f "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is down"
    # Send alert (email, Slack, etc.)
fi

# Check frontend
if curl -f "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is down"
fi

# Check database connections
DB_HEALTH=$(curl -s "${BACKEND_URL}/health" | jq -r '.database.postgres')
if [ "$DB_HEALTH" = "true" ]; then
    echo "✅ Database is healthy"
else
    echo "❌ Database connection failed"
fi
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy ChainTrack

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Run tests
        run: |
          cd backend
          npm test
          
      - name: Run linting
        run: |
          cd backend
          npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring setup configured
- [ ] Security headers configured
- [ ] CORS origins updated
- [ ] Rate limiting configured

### Post-deployment
- [ ] Health checks passing
- [ ] Database connections working
- [ ] WebSocket connections working
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] File uploads working (if applicable)
- [ ] Logs being written
- [ ] Monitoring alerts configured
- [ ] Performance metrics normal

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

2. **Port Already in Use**
```bash
# Find process using port
sudo lsof -i :3001
sudo kill -9 <PID>
```

3. **Permission Errors**
```bash
# Fix file permissions
sudo chown -R ubuntu:ubuntu /var/www/chaintrack
sudo chmod -R 755 /var/www/chaintrack
```

4. **Memory Issues**
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart services if needed
pm2 restart all
```

### Logs Investigation

```bash
# Backend logs
tail -f backend/logs/chaintrack.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

---

**For additional support, check the main README.md or create an issue in the repository.**