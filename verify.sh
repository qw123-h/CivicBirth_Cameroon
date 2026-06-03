#!/bin/bash
# Verification script for CivicBirth Cameroon project

echo "🔍 CivicBirth Cameroon - File Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        return 1
    fi
}

echo "📦 Backend Files:"
echo "----------------"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/.env.example"
check_file "backend/Dockerfile"
check_file "backend/src/server.ts"
check_file "backend/src/config/env.ts"
check_file "backend/src/config/database.ts"
check_file "backend/src/config/logger.ts"
check_file "backend/prisma/schema.prisma"
check_file "backend/prisma/seed.ts"
check_dir "backend/src/middleware"
check_dir "backend/src/modules"
echo ""

echo "🎨 Frontend Files:"
echo "------------------"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/vite.config.ts"
check_file "frontend/tailwind.config.ts"
check_file "frontend/index.html"
check_file "frontend/Dockerfile"
check_file "frontend/nginx.conf"
check_file "frontend/.env.example"
check_file "frontend/src/main.tsx"
check_file "frontend/src/App.tsx"
check_file "frontend/src/types/index.ts"
check_file "frontend/src/lib/api.ts"
check_file "frontend/src/store/authStore.ts"
check_dir "frontend/src/pages"
check_dir "frontend/src/i18n"
echo ""

echo "🐳 Docker & Deployment:"
echo "----------------------"
check_file "docker-compose.yml"
check_file ".env.local"
check_file ".dockerignore"
check_file ".gitignore"
check_file "Makefile"
check_file "README.md"
check_file "PROJECT_SUMMARY.md"
check_dir ".github/workflows"
check_file ".github/workflows/ci.yml"
check_file ".github/workflows/cd.yml"
echo ""

echo "📚 Documentation:"
echo "-----------------"
check_file "docs/API_DOCS.md"
check_file "docs/DEPLOYMENT.md"
echo ""

echo "✅ Verification Complete!"
echo ""
echo "Quick Start:"
echo "  docker-compose up --build"
echo ""
echo "Login:"
echo "  Email: admin@civicbirth.local"
echo "  Password: Admin@2026!"
echo ""
echo "Access Points:"
echo "  Frontend: http://localhost:5173"
echo "  Backend: http://localhost:3000"
echo "  pgAdmin: http://localhost:5050"
