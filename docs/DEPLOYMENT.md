# Deployment Guide

## Overview

This guide covers deploying CivicBirth Cameroon to production environments. The application is containerized and can be deployed via:
1. Docker Compose (single server)
2. Kubernetes (scalable, multi-node clusters)
3. AWS, Azure, GCP (managed services)

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 15+ (managed or self-hosted)
- 2+ CPU cores, 4GB+ RAM minimum
- SSL/TLS certificate
- Domain name

## Environment Configuration

### Production Variables

Create `.env.production` with:

```env
# Database
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@managed-db.example.com:5432/civicbirth_prod

# Authentication (Generate with: openssl rand -base64 48)
JWT_SECRET=<GENERATE_64_CHAR_RANDOM_STRING>
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
FRONTEND_URL=https://civicbirth.gov.cm

# Storage (Supabase for certificates)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=<SERVICE_KEY>
SUPABASE_STORAGE_BUCKET=certificates

# App
APP_BASE_URL=https://civicbirth.gov.cm
CERTIFICATE_VERIFY_BASE_URL=https://civicbirth.gov.cm/verify
```

**Security Notes:**
- Use strong passwords (minimum 16 characters)
- Never commit `.env.production` to git
- Use AWS Secrets Manager / Azure KeyVault / HashiCorp Vault
- Rotate JWT_SECRET regularly
- Enable database user-level access controls

## Deployment Methods

### 1. Docker Compose (Single Server)

#### Hardware Requirements
- 2-4 CPU cores
- 8GB RAM minimum
- 50GB storage (logs, backups)
- SSD recommended

#### Setup

```bash
# SSH to server
ssh ubuntu@production.example.com

# Clone repository
git clone https://github.com/your-org/civicbirth-cameroon.git
cd civicbirth-cameroon

# Copy production environment
nano .env.production
# Set all production variables

# Make environment available
cp .env.production .env

# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify health
docker-compose ps
# All containers should be "Up" and pass health checks

# Check logs
docker-compose logs -f backend
```

#### Reverse Proxy with Nginx

```nginx
upstream civicbirth-frontend {
    server frontend:80;
}

upstream civicbirth-backend {
    server backend:3000;
}

server {
    listen 80;
    server_name civicbirth.gov.cm;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name civicbirth.gov.cm;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/civicbirth.gov.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/civicbirth.gov.cm/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://civicbirth-frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://civicbirth-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }
}
```

#### SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d civicbirth.gov.cm

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Database Backup Strategy

```bash
#!/bin/bash
# backup.sh - Run daily via cron

BACKUP_DIR="/backups/civicbirth"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="civicbirth-postgres"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec $DB_CONTAINER pg_dump -U postgres civicbirth | \
    gzip > $BACKUP_DIR/civicbirth_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/civicbirth_$DATE.sql.gz \
    s3://civicbirth-backups/postgres/
```

Add to crontab:
```
0 2 * * * /opt/civicbirth/backup.sh
```

### 2. Kubernetes Deployment

#### Prerequisites
- kubectl 1.24+
- Helm 3.10+ (optional)
- Kubernetes cluster 1.24+

#### Namespace & Secrets

```bash
# Create namespace
kubectl create namespace civicbirth-prod

# Create secrets
kubectl create secret generic civicbirth-secrets \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=JWT_SECRET=... \
  --from-literal=SUPABASE_SERVICE_KEY=... \
  -n civicbirth-prod

# Create configmap
kubectl create configmap civicbirth-config \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info \
  -n civicbirth-prod
```

#### Deploy Frontend & Backend

```bash
# Apply manifests
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres/ -n civicbirth-prod
kubectl apply -f k8s/backend/ -n civicbirth-prod
kubectl apply -f k8s/frontend/ -n civicbirth-prod
kubectl apply -f k8s/ingress.yaml -n civicbirth-prod

# Verify deployment
kubectl get pods -n civicbirth-prod
kubectl get svc -n civicbirth-prod
kubectl get ingress -n civicbirth-prod

# Check logs
kubectl logs -f deployment/backend -n civicbirth-prod
```

#### Scaling

```bash
# Scale backend replicas
kubectl scale deployment backend --replicas=3 -n civicbirth-prod

# Monitor rollout
kubectl rollout status deployment/backend -n civicbirth-prod
```

#### Monitoring

```bash
# Container metrics
kubectl top nodes
kubectl top pods -n civicbirth-prod

# Export logs to CloudWatch/ELK
# (configure with logging sidecar in deployment)
```

### 3. Cloud Platforms

#### AWS ECS/Fargate

```bash
# Push images to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag civicbirth-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/civicbirth-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/civicbirth-backend:latest

# Create ECS service via AWS Console or CLI
# - Define task definitions for backend/frontend
# - Create Application Load Balancer
# - Configure RDS PostgreSQL
# - Set CloudWatch alarms
```

#### Azure Container Instances / App Service

```bash
# Push to Azure Container Registry
az acr login --name civicbirthacr
docker tag civicbirth-backend:latest civicbirthacr.azurecr.io/civicbirth-backend:latest
docker push civicbirthacr.azurecr.io/civicbirth-backend:latest

# Deploy via App Service
az appservice plan create --name civicbirth-plan --resource-group civicbirth-rg --sku B2
az webapp create --resource-group civicbirth-rg --plan civicbirth-plan --name civicbirth-app
```

#### Google Cloud Run

```bash
# Build and deploy
gcloud run deploy civicbirth-backend \
  --source . \
  --build-config-file cloudbuild.yaml \
  --platform managed \
  --region us-central1 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET
```

## Post-Deployment Checklist

- [ ] **Health Checks**: Verify `/health` endpoints responding
- [ ] **Database**: Run migrations `npm run db:migrate` in backend container
- [ ] **First Admin User**: Seed or create initial admin account
- [ ] **SSL/TLS**: Verify HTTPS working with valid certificate
- [ ] **CORS**: Confirm CORS headers match production domain
- [ ] **Logging**: Check CloudWatch/ELK receiving logs
- [ ] **Backups**: Verify automated backup schedule running
- [ ] **Monitoring**: Set up alerts for CPU, memory, disk, error rates
- [ ] **Security Scanning**: Run Trivy/Snyk on container images
- [ ] **Load Testing**: Test with expected concurrent users
- [ ] **Disaster Recovery**: Test restore from backup
- [ ] **Documentation**: Update runbooks with deployment specifics

## Monitoring & Maintenance

### Logging

```bash
# View real-time logs
docker-compose logs -f backend

# Save logs
docker-compose logs > app.log

# For Kubernetes
kubectl logs -f deployment/backend -n civicbirth-prod
kubectl logs -f deployment/backend --tail=1000 -n civicbirth-prod
```

### Database Maintenance

```bash
# Connect to database
docker exec -it civicbirth-postgres psql -U postgres -d civicbirth

# Common queries
SELECT count(*) FROM civicbirth."BirthRegistration";
SELECT count(*) FROM civicbirth."AuditLog" WHERE "timestamp" > NOW() - INTERVAL '1 day';
SELECT * FROM civicbirth."User" WHERE role = 'NATIONAL_ADMIN';
```

### Health Monitoring

```bash
# Setup health check endpoint monitoring
curl https://civicbirth.gov.cm/api/health

# Response example
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## Troubleshooting

### Backend pod not starting

```bash
# Check logs
kubectl logs pod/backend-xyz -n civicbirth-prod
kubectl describe pod/backend-xyz -n civicbirth-prod

# Common issues:
# 1. DATABASE_URL not set
# 2. Database not reachable
# 3. Port already in use
```

### Database connection issues

```bash
# Test connectivity
kubectl run -it --rm debug \
  --image=postgres:15 \
  --restart=Never \
  -n civicbirth-prod \
  -- psql -h postgres -U postgres -d civicbirth -c "SELECT 1"
```

### High memory usage

```bash
# Check pod resources
kubectl top pods -n civicbirth-prod

# Increase resource limits in deployment.yaml
# and trigger rollout
kubectl rollout restart deployment/backend -n civicbirth-prod
```

## Disaster Recovery

### Restore from Backup

```bash
# List available backups
ls -la /backups/civicbirth/

# Restore database
docker exec civicbirth-postgres psql -U postgres -d civicbirth \
  < /backups/civicbirth/civicbirth_20260115_143000.sql

# Or from S3
aws s3 cp s3://civicbirth-backups/postgres/civicbirth_20260115_143000.sql.gz - | \
  gunzip | \
  docker exec -i civicbirth-postgres psql -U postgres -d civicbirth
```

### Failover Procedure

1. Verify database backup is current
2. Spin up new infrastructure
3. Restore database from latest backup
4. Deploy applications to new cluster
5. DNS failover to new load balancer
6. Verify all services operational
7. Archive logs from failed infrastructure

## Performance Tuning

### PostgreSQL Optimization

```sql
-- Enable query logging for slow queries
ALTER SYSTEM SET log_min_duration_statement = 100; -- log queries > 100ms
SELECT pg_reload_conf();

-- Create indexes for common filters
CREATE INDEX idx_registration_status ON "BirthRegistration"(status);
CREATE INDEX idx_registration_region ON "BirthRegistration"("regionId");
CREATE INDEX idx_audit_user ON "AuditLog"("userId");
```

### Node.js Memory Management

```bash
# Set memory limit for backend
docker-compose.yml:
  backend:
    environment:
      NODE_OPTIONS: "--max-old-space-size=1024"
```

### Nginx Caching

```nginx
# Cache static assets
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location ~* \.(js|css|png|jpg)$ {
    proxy_cache my_cache;
    proxy_cache_valid 200 7d;
    add_header Cache-Control "public, max-age=604800";
}
```

## Security Hardening

### Container Security

```bash
# Run security scan
trivy image ghcr.io/your-org/civicbirth-backend:latest

# Update base images regularly
docker pull node:20-alpine
docker pull postgres:15-alpine
```

### Network Policies (Kubernetes)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3000
  # Restrict egress to database and external services only
```

### Secrets Encryption

```bash
# Use sealed-secrets in Kubernetes
kubectl create secret generic civicbirth-secrets \
  --from-literal=DATABASE_URL=...
kubectl seal -f secret.yaml -w sealed-secret.yaml
```

## Rollback Procedures

### Docker Compose

```bash
# Identify last working image tag
docker-compose logs backend | tail -20

# Rollback to previous version
docker-compose pull backend:v1.0.0
docker-compose up -d

# Verify
docker-compose ps
```

### Kubernetes

```bash
# Check rollout history
kubectl rollout history deployment/backend -n civicbirth-prod

# Rollback to previous version
kubectl rollout undo deployment/backend -n civicbirth-prod

# Rollout to specific revision
kubectl rollout undo deployment/backend --to-revision=3 -n civicbirth-prod

# Monitor progress
kubectl rollout status deployment/backend -n civicbirth-prod
```

## Support & Escalation

For production issues:

1. **Severity 1** (System down): Page on-call engineer
2. **Severity 2** (Degraded): Notify team, investigate
3. **Severity 3** (Minor)**: Add to next sprint

Escalation contacts:
- Database: Database Team
- Infrastructure: DevOps Team
- Application: Development Team

---

**Last Updated**: January 2026  
**Version**: 1.0.0
