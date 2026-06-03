.PHONY: help dev build up down logs clean test lint docker-build docker-up docker-down install db-migrate db-seed local

help:
	@echo "CivicBirth Cameroon - Development Commands"
	@echo "============================================"
	@echo ""
	@echo "Local Development:"
	@echo "  make install        - Install all dependencies"
	@echo "  make dev            - Start development servers (backend + frontend)"
	@echo "  make test           - Run all tests"
	@echo "  make lint           - Lint code"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate     - Run pending Prisma migrations"
	@echo "  make db-seed        - Seed database with demo data"
	@echo "  make db-reset       - Reset database (drop & recreate)"
	@echo "  make db-studio      - Open Prisma Studio"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-up      - Start all containers (docker-compose up)"
	@echo "  make docker-down    - Stop all containers"
	@echo "  make docker-logs    - View container logs"
	@echo "  make docker-clean   - Remove containers and volumes"
	@echo ""
	@echo "Production:"
	@echo "  make build          - Build for production"
	@echo ""

install:
	@echo "Installing dependencies..."
	cd backend && npm install
	cd ../frontend && npm install
	@echo "✓ Dependencies installed"

dev:
	@echo "Starting development environment..."
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:5173"
	@echo ""
	@set -e; \
	trap 'kill $$backend_pid $$frontend_pid 2>/dev/null || true' INT TERM EXIT; \
	(cd backend && npm run dev) & backend_pid=$$!; \
	(cd frontend && npm run dev) & frontend_pid=$$!; \
	wait $$backend_pid $$frontend_pid

test:
	@echo "Running tests..."
	cd backend && npm run test

lint:
	@echo "Linting code..."
	cd backend && npm run lint
	cd ../frontend && npm run lint

build:
	@echo "Building for production..."
	cd backend && npm run build
	cd ../frontend && npm run build
	@echo "✓ Build complete"

db-migrate:
	@echo "Running database migrations..."
	cd backend && npm run db:migrate

db-seed:
	@echo "Seeding database..."
	cd backend && npm run db:seed
	@echo "✓ Database seeded with demo data"

db-reset:
	@echo "Resetting database..."
	cd backend && npx prisma migrate reset --force
	@echo "✓ Database reset complete"

db-studio:
	@echo "Opening Prisma Studio..."
	cd backend && npm run db:studio

docker-build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "✓ Docker images built"

docker-up:
	@echo "Starting docker-compose stack..."
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:5173"
	@echo "pgAdmin: http://localhost:5050"
	@echo ""
	docker-compose up -d
	@echo "✓ Stack started"
	@echo "Waiting for services to be ready..."
	sleep 10
	@echo "✓ Services ready!"

docker-down:
	@echo "Stopping docker-compose stack..."
	docker-compose down
	@echo "✓ Stack stopped"

docker-logs:
	docker-compose logs -f

docker-clean:
	@echo "Removing containers and volumes..."
	docker-compose down -v
	@echo "✓ Cleaned"

ps:
	docker-compose ps

shell-backend:
	docker exec -it civicbirth-backend sh

shell-db:
	docker exec -it civicbirth-postgres psql -U postgres -d civicbirth

watch-backend:
	cd backend && npm run dev

watch-frontend:
	cd frontend && npm run dev

local:
	@bash scripts/local-dev.sh
