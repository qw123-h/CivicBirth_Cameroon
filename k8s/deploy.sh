#!/bin/bash
# Deploy to Kubernetes cluster

set -e

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${COLOR_BLUE}🚀 CivicBirth Kubernetes Deployment${NC}"
echo "========================================"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${COLOR_RED}❌ kubectl not found. Please install kubectl.${NC}"
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${COLOR_RED}❌ Not connected to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${COLOR_GREEN}✓ Connected to cluster: $(kubectl config current-context)${NC}"
echo ""

# Create namespaces
echo -e "${COLOR_YELLOW}📝 Creating namespaces...${NC}"
kubectl apply -f k8s/namespace.yaml
echo ""

# Create ConfigMaps and Secrets
echo -e "${COLOR_YELLOW}📝 Creating ConfigMaps and Secrets...${NC}"
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
echo -e "${COLOR_RED}⚠️  UPDATE SECRETS BEFORE APPLYING TO PRODUCTION:${NC}"
echo "   kubectl edit secret civicbirth-secrets -n civicbirth-prod"
echo ""

# Create RBAC
echo -e "${COLOR_YELLOW}📝 Creating RBAC resources...${NC}"
kubectl apply -f k8s/rbac.yaml
echo ""

# Create PostgreSQL
echo -e "${COLOR_YELLOW}📝 Creating PostgreSQL deployment...${NC}"
kubectl apply -f k8s/postgres.yaml
echo -e "${COLOR_YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=Ready pod -l app=postgres -n civicbirth-prod --timeout=300s
echo -e "${COLOR_GREEN}✓ PostgreSQL is ready${NC}"
echo ""

# Create Backend
echo -e "${COLOR_YELLOW}📝 Creating Backend deployment...${NC}"
kubectl apply -f k8s/backend.yaml
echo -e "${COLOR_YELLOW}⏳ Waiting for Backend to be ready...${NC}"
kubectl wait --for=condition=Ready pod -l app=backend -n civicbirth-prod --timeout=300s
echo -e "${COLOR_GREEN}✓ Backend is ready${NC}"
echo ""

# Create Frontend
echo -e "${COLOR_YELLOW}📝 Creating Frontend deployment...${NC}"
kubectl apply -f k8s/frontend.yaml
echo -e "${COLOR_YELLOW}⏳ Waiting for Frontend to be ready...${NC}"
kubectl wait --for=condition=Ready pod -l app=frontend -n civicbirth-prod --timeout=300s
echo -e "${COLOR_GREEN}✓ Frontend is ready${NC}"
echo ""

# Create Policies
echo -e "${COLOR_YELLOW}📝 Creating Network Policies and Resource Quotas...${NC}"
kubectl apply -f k8s/policies.yaml
echo ""

# Create Ingress
echo -e "${COLOR_YELLOW}📝 Creating Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml
echo ""

# Summary
echo -e "${COLOR_GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Status:"
kubectl get all -n civicbirth-prod
echo ""
echo "🔗 Services:"
kubectl get svc -n civicbirth-prod
echo ""
echo "📦 Next steps:"
echo "  1. Update production secrets: kubectl edit secret civicbirth-secrets -n civicbirth-prod"
echo "  2. Configure DNS: civicbirth.gov.cm → Ingress IP"
echo "  3. Monitor rollout: kubectl logs -f deployment/backend -n civicbirth-prod"
echo "  4. Check pods: kubectl get pods -n civicbirth-prod"
echo ""
