# CivicBirth Cameroon 🏥

**Birth Registration Digital Platform for Cameroon**

A production-ready, containerized web application for digitizing birth registration in Cameroon, aligned with UNICEF, World Bank ID4D, and African Union APAI-CRVS standards.

## 🎯 Overview

CivicBirth is a comprehensive birth registration system designed to facilitate:
- Civil registration data collection from healthcare facilities, communities, and field agents
- Birth certificate generation and verification
- Real-time analytics and SDG 16.9 progress tracking
- Role-based access control for administrators, regional officers, and registrars
- Multi-region deployment across Cameroon's 10 administrative regions

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 20+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Git

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/civicbirth-cameroon.git
cd civicbirth-cameroon

# Start the application stack
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# pgAdmin: http://localhost:5050 (optional)

# Default login credentials
# Email: admin@civicbirth.local
# Password: Admin@2026!
```

### Option 2: Local Development

```bash
# Copy the backend environment template and point DATABASE_URL at a local PostgreSQL instance
cp backend/.env.example backend/.env

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database from the backend folder
cd ../backend
npm run db:migrate
npm run db:seed

# Start the development servers after PostgreSQL is running
cd ..
make dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Option 3: Using Make Commands

```bash
# See all available commands
make help

# Build Docker images
make docker-build

# Start stack
make docker-up

# View logs
make docker-logs

# Stop stack
make docker-down
```

## 📋 Features

### Backend (Node.js + Express + TypeScript)
- ✅ JWT-based authentication with refresh token rotation
- ✅ Role-based access control (RBAC) with 6 user roles
- ✅ Birth registration CRUD with validation workflow
- ✅ Certificate generation with QR codes
- ✅ Field agent management and performance tracking
- ✅ Comprehensive analytics and SDG 16.9 tracking
- ✅ Audit logging for all mutations
- ✅ Rate limiting and security headers (Helmet)
- ✅ Structured logging with Winston
- ✅ Database migrations with Prisma

### Frontend (React 18 + TypeScript + Tailwind CSS)
- ✅ Split-screen responsive login page
- ✅ Dashboard with KPI cards and visualizations
- ✅ Birth records table with pagination
- ✅ Multi-step registration form (React Hook Form + Zod)
- ✅ Certificate management and generation
- ✅ Advanced analytics with Recharts
- ✅ Field agent management interface
- ✅ User settings and language switching (EN/FR)
- ✅ Public certificate verification page
- ✅ Internationalization (i18next) with French/English

### DevOps
- ✅ Multi-stage Docker builds for both frontend and backend
- ✅ Optimized Nginx configuration for SPA routing
- ✅ PostgreSQL with health checks
- ✅ Docker Compose orchestration
- ✅ Environment-based configuration
- ✅ Health check endpoints for orchestration

## 🏗️ Architecture

The backend now uses an object-oriented service layer. Controllers remain thin HTTP adapters, and the actual business rules live in service classes such as `AuthService`, `RegistrationsService`, `AgentsService`, `CertificatesService`, `UsersService`, and `AnalyticsService`.

Those services all inherit from a shared `BaseService`, which owns the Prisma client. That keeps data access consistent, makes the code easier to test, and gives each service a clean place to grow without duplicating setup logic.

For a deeper explanation of the runtime flow and local boot order, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Tech Stack

**Backend:**
- Node.js 20 LTS
- Express.js 4
- TypeScript 5
- Prisma 5 ORM
- PostgreSQL 15
- JWT Authentication
- Zod Validation

**Frontend:**
- React 18
- TypeScript 5
- Vite
- Tailwind CSS 3
- React Router v6
- React Query v5
- Zustand (state management)
- React Hook Form
- Recharts
- i18next (internationalization)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy & SPA serving)
- PostgreSQL (relational database)

### Project Structure

```
civicbirth-cameroon/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (env, db, logger)
│   │   ├── middleware/      # Auth, RBAC, validation, audit, error
│   │   ├── modules/         # API modules (auth, registrations, certificates, etc)
│   │   └── utils/           # Helper functions
│   ├── prisma/              # Database schema and migrations
│   ├── Dockerfile           # Multi-stage backend build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── lib/             # API client, utilities
│   │   ├── store/           # Zustand state
│   │   ├── types/           # TypeScript interfaces
│   │   ├── i18n/            # Translations (EN, FR)
│   │   └── providers/       # Context providers
│   ├── Dockerfile           # Multi-stage frontend build
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── docker-compose.yml       # Service orchestration
├── Makefile                 # Development commands
├── docs/ARCHITECTURE.md     # Runtime and architecture notes
└── README.md
```

## 📊 Database Schema

The application uses Prisma ORM with the following core models:

```prisma
- User (admin, regional officers, registrars, field agents)
- Region (10 Cameroon administrative regions)
- Agent (field agents with performance metrics)
- BirthRegistration (birth event records)
- Certificate (issued birth certificates)
- AuditLog (complete mutation history)
```

See [backend/prisma/schema.prisma](backend/prisma/schema.prisma) for full details.

## 🔐 Authentication & Authorization

### User Roles (6 Total)
1. **NATIONAL_ADMIN** - Full system access
2. **REGIONAL_OFFICER** - Regional data management
3. **MUNICIPAL_REGISTRAR** - Local registration authority
4. **FIELD_AGENT** - On-ground data collection
5. **UNICEF_MONITOR** - Monitoring and verification
6. **WORLD_BANK_OBSERVER** - Analytics and reporting

### Authentication Flow
- Login with email/password
- Server returns `accessToken` (1h expiry) and `refreshToken` (7d expiry)
- Client stores tokens with Zustand + localStorage persistence
- Axios interceptor auto-attaches Bearer token to requests
- 401 responses trigger auto-refresh with token rotation
- Failed refresh logs out user and redirects to login

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login              # Login
POST   /api/auth/refresh            # Refresh tokens
GET    /api/auth/me                 # Current user
POST   /api/auth/logout             # Logout
```

### Birth Registrations
```
GET    /api/registrations           # List (paginated, role-filtered)
POST   /api/registrations           # Create new
GET    /api/registrations/:id       # Get one
PATCH  /api/registrations/:id       # Update
PATCH  /api/registrations/:id/validate  # Validate
PATCH  /api/registrations/:id/reject    # Reject
GET    /api/registrations/verify/:ref   # Public verification (no auth)
```

### Certificates
```
GET    /api/certificates            # List
POST   /api/certificates/:regId/generate  # Generate
GET    /api/certificates/:id        # Get
GET    /api/certificates/:id/download    # Download
```

### Analytics
```
GET    /api/analytics/summary       # Overview stats
GET    /api/analytics/by-region     # Regional breakdown
GET    /api/analytics/by-month      # Monthly trend
GET    /api/analytics/sdg-tracker   # SDG 16.9 progress
```

### Agents
```
GET    /api/agents                  # List
POST   /api/agents                  # Create
GET    /api/agents/:id              # Get one
PATCH  /api/agents/:id              # Update
GET    /api/agents/:id/performance  # Performance metrics
```

### Users (Admin Only)
```
GET    /api/users                   # List
POST   /api/users                   # Create
GET    /api/users/:id               # Get one
PATCH  /api/users/:id               # Update
DELETE /api/users/:id               # Delete
```

For full API documentation, see [API_DOCS.md](API_DOCS.md).

##  🎨 UI/UX Design

### Colors (Cameroon Flag Inspired)
- **Primary Green**: `#00843D` (Cameroon flag)
- **Secondary Red**: `#CE1126` (Cameroon flag)
- **Accent Yellow**: `#FCD116` (Cameroon flag)

### Typography
- **Headings**: Inter font-family, bold weights
- **Body**: Inter font-family with standard weight

### Components
- Card-based layouts with shadows
- Status badges with semantic colors
- Responsive tables with pagination
- Charts (line, bar, pie) via Recharts
- Forms with React Hook Form + Zod validation

## 📱 Pages

### Public Pages
- **Login** (`/login`) - Authentication entry point
- **Verify** (`/verify/:referenceNumber`) - Public certificate verification

### Protected Pages (Private Routes)
- **Dashboard** (`/dashboard`) - KPIs, charts, recent data
- **Birth Records** (`/registrations`) - Paginated registration list
- **New Registration** (`/registrations/new`) - Multi-step form
- **Certificates** (`/certificates`) - Generate and manage certificates
- **Analytics** (`/analytics`) - Advanced reporting and SDG tracking
- **Agents** (`/agents`) - Agent management and performance
- **Settings** (`/settings`) - User profile, preferences, language

## 🧪 Testing

```bash
# Run unit tests
make test

# Run tests with coverage
cd backend
npm run test:cov

# Run linting
make lint
```

## 🐳 Docker Details

### Build Arguments
- Multi-stage builds to minimize final image size
- Frontend: Node builder → Nginx production
- Backend: Node builder → Node production runtime

### Health Checks
All services include health checks for container orchestration:
- Frontend: HTTP GET /health
- Backend: HTTP GET /health
- PostgreSQL: pg_isready check

### Volumes
- `postgres_data` - PostgreSQL data persistence
- `./logs` - Application logs (backend)
- Development: Source code mounted for hot-reload

### Networks
Services communicate via `civicbirth-network` bridge network.

## 📝 Environment Variables

### Required (Backend)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<minimum-64-characters>
```

### Optional
```
NODE_ENV=development|production
LOG_LEVEL=debug|info|warn|error
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

For complete list, see [.env.example](backend/.env.example).

## 📚 Documentation

Additional documentation:
- [API_DOCS.md](docs/API_DOCS.md) - Detailed endpoint reference
- [DOCKER.md](docs/DOCKER.md) - Docker configuration details
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment guide
- [KUBERNETES.md](docs/KUBERNETES.md) - Kubernetes manifests

## 🚢 Deployment Guide

### Production Checklist
- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Configure PostgreSQL with persistent volume
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domain
- [ ] Setup backup strategy
- [ ] Monitor logs and metrics
- [ ] Configure rate limiting thresholds
- [ ] Test disaster recovery
- [ ] Document admin procedures

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed production setup.

## 📊 SDG 16.9 Tracking

The application tracks progress toward **UN Sustainable Development Goal 16.9**:
> "Develop effective, accountable and inclusive institutions at all levels"

Specifically, the birth registration coverage metric:
- Current vs. historical registration counts
- Regional progress toward 100% coverage by 2030
- Status indicators (on-track, at-risk, critical)
- Demographic breakdowns (gender, channel, age)

## 🤝 Contributing

Guidelines for contributions:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

Code standards:
- TypeScript strict mode throughout
- Zod for runtime validation
- ESLint + Prettier for code style
- Jest for test coverage
- Wire security headers and CORS

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- UNICEF for birth registration standards
- World Bank for identity solutions framework (ID4D)
- African Union APAI-CRVS for continental standards
- Cameroon Ministry of Justice for civil registration guidance

## 📞 Support

For issues or questions:
1. Check [existing GitHub issues](https://github.com/your-org/civicbirth-cameroon/issues)
2. Review [API_DOCS.md](docs/API_DOCS.md) and [DEPLOYMENT.md](docs/DEPLOYMENT.md)
3. Contact development team at support@civicbirth.local

---

**Built with ❤️ for Cameroon's Civil Registration**

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
