# CivicBirth Cameroon - Installation & Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Node.js 20+, PostgreSQL 15+

### Option 1: Docker Compose (Recommended)

```bash
# Clone or download the repository
git clone https://github.com/your-org/civicbirth-cameroon.git
cd civicbirth-cameroon

# Start the application
docker-compose up --build

# Wait for services to be ready (2-3 minutes)
# You'll see: "civicbirth-backend | Server running on http://0.0.0.0:3000"
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- pgAdmin (optional): http://localhost:5050

**Login credentials:**
```
Email: admin@civicbirth.local
Password: Admin@2026!
```

---

## 📥 Installation Methods

### Method 1: Docker Compose (Easiest - Recommended)

**Requirements:**
- Docker Desktop or Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB RAM, 20GB disk space minimum

**Steps:**

```bash
# 1. Clone repository
git clone https://github.com/your-org/civicbirth-cameroon.git
cd civicbirth-cameroon

# 2. Build and start services
docker-compose up --build

# 3. Wait for all services to start (watch for green "Up" status)
docker-compose ps

# 4. Access frontend
# Open browser: http://localhost:5173
```

**Stopping the application:**
```bash
docker-compose down
# Remove volumes (delete data):
docker-compose down -v
```

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

### Method 2: Local Development (Node.js)

**Requirements:**
- Node.js 20.10+
- npm or yarn
- PostgreSQL 15+ running locally
- Git

**Steps:**

```bash
# 1. Clone repository
git clone https://github.com/your-org/civicbirth-cameroon.git
cd civicbirth-cameroon

# 2. Install dependencies
npm install --prefix backend
npm install --prefix frontend

# 3. Setup PostgreSQL
# Create database:
createdb civicbirth

# 4. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env:
# DATABASE_URL=postgresql://username:password@localhost:5432/civicbirth
# JWT_SECRET=<generate 64-char random string>

# 5. Run migrations & seed
cd backend
npm run db:migrate
npm run db:seed
cd ..

# 6. Start both services
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

### Method 3: Production Deployment

**See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:**
- Kubernetes deployment
- AWS/Azure/GCP cloud platforms
- SSL/TLS configuration
- Database backups
- Monitoring setup
- Security hardening

---

## 📋 Troubleshooting

### Docker Issues

**Error: "Cannot connect to Docker daemon"**
```bash
# Solution: Start Docker Desktop or Docker engine
sudo systemctl start docker  # Linux
# Docker Desktop (Windows/Mac)
```

**Error: "Port 5173 already in use"**
```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9

# Or use different port
docker-compose -f docker-compose.yml up \
  -e FRONTEND_PORT=5174 --build
```

**Error: "Database connection refused"**
```bash
# Wait for PostgreSQL to be ready
docker-compose logs postgres | grep "ready to accept"

# Or restart
docker-compose restart postgres
docker-compose restart backend
```

### PostgreSQL Issues

**Cannot connect to database:**
```bash
# Check connection
docker exec civicbirth-postgres psql -U postgres -c "SELECT 1"

# Check logs
docker-compose logs postgres
```

**Database not initialized:**
```bash
# Manually run seed
docker-compose exec backend npm run db:seed
```

### Frontend Issues

**Blank page or 404 errors:**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check browser console for errors
# Press F12 to open DevTools
```

**API connection errors:**
```bash
# Verify backend is running
curl http://localhost:3000/health

# Check API URL in frontend/.env
VITE_API_URL=http://localhost:3000
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env or .env.local):**
```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/civicbirth
JWT_SECRET=<64+ character random string>

# Optional
NODE_ENV=development
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:5173
PORT=3000
```

**Generate JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 48

# Windows
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

### Database Configuration

**PostgreSQL settings (for development):**
```env
DB_NAME=civicbirth
DB_USER=postgres
DB_PASSWORD=postgres_password
```

**Connection string format:**
```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]

Examples:
postgresql://postgres:password@localhost:5432/civicbirth
postgresql://user@/civicbirth  # Unix socket
```

---

## 🧪 Testing the Application

### Verify Installation

```bash
# Backend health check
curl http://localhost:3000/health

# Frontend accessibility
curl http://localhost:5173

# API authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@civicbirth.local","password":"Admin@2026!"}'
```

### Test User Accounts

```
Role                    | Email                          | Password
------------------------+--------------------------------+-----------
National Admin          | admin@civicbirth.local        | Admin@2026!
Regional Officer        | officer@civicbirth.local      | Admin@2026!
Municipal Registrar     | registrar@civicbirth.local    | Admin@2026!
Field Agent             | agent@civicbirth.local        | Admin@2026!
UNICEF Monitor          | unicef@civicbirth.local       | Admin@2026!
World Bank Observer     | worldbank@civicbirth.local    | Admin@2026!
```

### Sample Operations

1. **Login**: Admin → Dashboard
2. **View registrations**: Birth Records → Paginated list
3. **Create registration**: New Registration → 3-step form
4. **Validate registration**: Registrations → Validate button
5. **Generate certificate**: Certificates → Generate from validated
6. **View analytics**: Analytics → Dashboards & charts
7. **Manage agents**: Agents → Create, view performance
8. **Switch language**: Settings → Language selector

---

## 📊 Database Management

### Access Database

**Via Docker:**
```bash
docker exec -it civicbirth-postgres psql -U postgres -d civicbirth
```

**Via pgAdmin (web GUI):**
```
URL: http://localhost:5050
Email: admin@civicbirth.local
Password: admin
```

**Common queries:**
```sql
-- View users
SELECT id, email, role FROM "User" LIMIT 10;

-- View registrations
SELECT "referenceNumber", "childName", status FROM "BirthRegistration" LIMIT 10;

-- Count by status
SELECT status, COUNT(*) FROM "BirthRegistration" GROUP BY status;

-- View audit log
SELECT "action", "timestamp", "userId" FROM "AuditLog" ORDER BY "timestamp" DESC LIMIT 20;
```

### Backups & Restore

**Backup database:**
```bash
docker exec civicbirth-postgres pg_dump -U postgres civicbirth > backup.sql
```

**Restore from backup:**
```bash
docker exec -i civicbirth-postgres psql -U postgres civicbirth < backup.sql
```

---

## 📈 Performance Optimization

### Frontend Optimization

```bash
# Build for production
cd frontend
npm run build

# Result: 'dist' folder with optimized files
ls -lh dist/
```

### Backend Optimization

```bash
# Enable query logging
docker exec civicbirth-postgres psql -U postgres -d civicbirth \
  -c "ALTER SYSTEM SET log_min_duration_statement = 100;"

# Check slow queries
docker exec civicbirth-postgres psql -U postgres -d civicbirth \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS/SSL in production
- [ ] Configure CORS for your domain
- [ ] Enable database SSL connections
- [ ] Setup automated backups
- [ ] Configure rate limiting thresholds
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Run vulnerability scans (Trivy, Snyk)

---

## 📝 Useful Commands

### Using Make (if installed)

```bash
# List all commands
make help

# Development
make install          # Install dependencies
make dev             # Start dev servers
make build           # Build for production

# Docker
make docker-up       # Start stack
make docker-down     # Stop stack
make docker-logs     # View logs

# Database
make db-migrate      # Run migrations
make db-seed         # Seed with demo data
make db-reset        # Full reset
```

### Direct Commands

```bash
# Backend
cd backend
npm run dev          # Development server
npm run build        # Build TypeScript
npm run lint         # Lint code
npm run type-check   # Check types
npm run test         # Run tests
npm run db:migrate   # Run migrations
npm run db:seed      # Seed data

# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Lint code
npm run type-check   # Check types
```

---

## 🔍 Monitoring & Logs

### View Logs

```bash
# Docker Compose
docker-compose logs -f                    # All services
docker-compose logs -f backend            # Backend only
docker-compose logs -f postgres           # Database only
docker-compose logs -f frontend           # Frontend only

# Last 100 lines
docker-compose logs --tail=100 backend

# Backend logs file (for development)
tail -f logs/all.log
tail -f logs/error.log
```

### Health Checks

```bash
# Check all services
docker-compose ps

# Status codes:
# Up - Service is running
# Exited - Service stopped
# Unhealthy - Service failing health check
```

---

## 🚀 Going to Production

### Pre-production Checklist

- [ ] Review [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [ ] Configure production database
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure domain name
- [ ] Setup database backups
- [ ] Configure monitoring/logging
- [ ] Load test application
- [ ] Security audit
- [ ] Performance testing
- [ ] Disaster recovery plan

### Deployment Options

1. **Docker Compose** (single server)
   - Simplest for 1-2 server setup
   - See deployment guide

2. **Kubernetes** (scalable)
   - For high availability
   - Manifests in `k8s/` directory
   - See deployment guide

3. **Cloud Platforms** (AWS, Azure, GCP)
   - Managed databases
   - Auto-scaling
   - See deployment guide

---

## 📞 Support

**For issues:**
1. Check [README.md](README.md#troubleshooting)
2. Review [docs/API_DOCS.md](docs/API_DOCS.md)
3. Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. Review application logs
5. Check GitHub issues

**Documentation:**
- [README.md](README.md) - Project overview
- [docs/API_DOCS.md](docs/API_DOCS.md) - API reference
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete inventory

---

## ✅ Success Indicators

After `docker-compose up --build`, you should see:

```
✓ Backend container running and healthy
✓ Frontend container running and healthy
✓ PostgreSQL database running and ready
✓ pgAdmin running (optional)
✓ All containers show "Up" in docker-compose ps
✓ Frontend loads at http://localhost:5173
✓ Backend responds to http://localhost:3000/health
✓ Login successful with credentials above
✓ Dashboard displays data
✓ All pages and features functional
```

---

**🎉 CivicBirth Cameroon is ready to use!**

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: January 2026

For detailed production deployment, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
