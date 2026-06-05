# Infrastructure Deployment Quick Start Guide

## Overview

This guide walks you through deploying CivicBirth on a cloud infrastructure (AWS recommended).

---

## Pre-Deployment Checklist

- [ ] AWS account created (or GCP/Azure)
- [ ] Terraform installed: `terraform --version`
- [ ] AWS CLI configured: `aws configure`
- [ ] Ansible installed: `ansible --version`
- [ ] kubectl installed: `kubectl version --client`
- [ ] SSH key pair generated for servers
- [ ] Domain name configured (for SSL/TLS)
- [ ] DNS records pointed to load balancer (after step 2)

---

## Phase 1: Infrastructure Provisioning with Terraform (15-20 min)

### Step 1.1: Prepare Terraform Configuration

```bash
cd infrastructure/terraform/aws

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

**Important variables to update:**
- `aws_region` - Choose region (us-east-1, eu-west-1, etc.)
- `environment` - Set to "production" or "development"
- `db_password` - Strong, unique password (min 16 chars)
- `instance_type` - t3.large (or smaller for dev: t3.medium)
- `db_instance_class` - db.t3.small (or smaller for dev: db.t3.micro)

### Step 1.2: Initialize Terraform

```bash
# Download required providers and modules
terraform init

# Verify configuration syntax
terraform validate
```

### Step 1.3: Plan Deployment

```bash
# See what will be created (no changes made yet)
terraform plan -out=tfplan

# Review the output carefully!
# This should show:
# - 1x EKS cluster
# - 2x EC2 nodes
# - 1x RDS PostgreSQL
# - 1x Load Balancer
# - VPC, subnets, security groups
```

### Step 1.4: Apply Deployment

```bash
# Create all infrastructure
terraform apply tfplan

# This will take ~15-20 minutes...
# Watch the output for the cluster endpoint and load balancer DNS
```

### Step 1.5: Save Outputs

```bash
# Save important information
terraform output > deployment-outputs.txt

# Extract kubeconfig command (you'll need this next)
terraform output kubeconfig_command
```

---

## Phase 2: Configure Kubernetes Access (5 min)

### Step 2.1: Update kubeconfig

```bash
# Use the command from terraform output
aws eks update-kubeconfig --name civicbirth-eks --region us-east-1

# Verify access
kubectl get nodes
# Should show 2 nodes in "Ready" state
```

### Step 2.2: Verify Cluster Health

```bash
# Check all system pods are running
kubectl get pods --all-namespaces

# Check node resources
kubectl top nodes

# Check persistent volumes
kubectl get pv
```

---

## Phase 3: Setup with Ansible (20-30 min)

### Step 3.1: Prepare Ansible Inventory

```bash
cd infrastructure/ansible

# Get your EKS node IPs
kubectl get nodes -o wide

# Edit inventory/hosts.ini
# Replace example IPs with actual EKS node IPs
nano inventory/hosts.ini

# Ensure SSH key path is correct
# Should be: ansible_ssh_private_key_file=~/.ssh/civicbirth.pem
```

### Step 3.2: Setup Docker and Kubernetes Tools

```bash
# Test SSH connectivity first
ansible all -i inventory/hosts.ini -m ping

# Run setup playbook (installs Docker, kubectl, helm, etc.)
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml --check

# If --check looks good, run actual playbook
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml -v
```

### Step 3.3: Configure Firewall

```bash
# IMPORTANT: Edit playbook to add your IP address!
# Search for "allowed_ssh_ips" and update with your IP
nano playbooks/setup-firewall.yml

# Run firewall setup
ansible-playbook -i inventory/hosts.ini playbooks/setup-firewall.yml -v
```

---

## Phase 4: Deploy Application (15-20 min)

### Step 4.1: Create Kubernetes Secrets

```bash
# Set environment variables with your secrets
export DB_PASSWORD="$(terraform output -raw db_password)"
export JWT_SECRET="your-strong-random-jwt-secret-here"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-supabase-service-key"

# Verify secrets are set
echo $DB_PASSWORD
echo $JWT_SECRET
```

### Step 4.2: Deploy Application via Ansible

```bash
# Deploy app to Kubernetes
ansible-playbook -i inventory/hosts.ini playbooks/deploy-app.yml \
  -e "database_url=postgresql://postgres:${DB_PASSWORD}@$(terraform output -raw rds_address):5432/civicbirth" \
  -e "jwt_secret=${JWT_SECRET}" \
  -e "supabase_url=${SUPABASE_URL}" \
  -e "supabase_service_key=${SUPABASE_SERVICE_KEY}" \
  -v
```

### Step 4.3: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n civicbirth-prod

# Check pod logs
kubectl logs -f deployment/backend -n civicbirth-prod

# Check services
kubectl get svc -n civicbirth-prod

# Port forward to test locally
kubectl port-forward svc/backend 3000:3000 -n civicbirth-prod
# Now access: http://localhost:3000/health
```

---

## Phase 5: Setup Load Balancer & DNS (10-15 min)

### Step 5.1: Get Load Balancer DNS

```bash
# Get load balancer hostname
kubectl get ingress -n civicbirth-prod

# Or from Terraform output
terraform output alb_dns_name
```

### Step 5.2: Configure DNS

1. Go to your domain registrar (GoDaddy, Namecheap, Route 53, etc.)
2. Create CNAME record:
   - `civicbirth.yourdomain.com` → `<alb-dns-name>`
3. Wait for DNS propagation (5-30 minutes)

### Step 5.3: Configure SSL/TLS Certificate

**Option A: Let's Encrypt (Free)**

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat << EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@civicbirth.cm
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

**Option B: AWS ACM (Recommended)**

```bash
# Create certificate in AWS Console or CLI
aws acm request-certificate \
  --domain-name civicbirth.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

---

## Phase 6: Monitoring & Logging (Optional but Recommended)

### Step 6.1: Deploy Prometheus & Grafana

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus Stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d
```

### Step 6.2: Access Grafana

```bash
# Port forward to Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Access at http://localhost:3000
# Default credentials: admin / prom-operator
```

---

## Phase 7: Post-Deployment Verification

### Checklist

- [ ] All pods running: `kubectl get pods -A`
- [ ] Services accessible: `kubectl get svc -A`
- [ ] Health check passes: `curl https://civicbirth.yourdomain.com/health`
- [ ] Database working: `kubectl logs deployment/backend -n civicbirth-prod | grep -i "database"`
- [ ] Logs being collected: `kubectl logs deployment/frontend -n civicbirth-prod`
- [ ] SSL certificate valid: Check in browser or `openssl s_client -connect civicbirth.yourdomain.com:443`

### Test Application

```bash
# Login test
curl -X POST https://civicbirth.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@civicbirth.cm","password":"Test@123"}'

# Should return: { "accessToken": "...", "user": {...} }
```

---

## Troubleshooting

### Pod not starting?
```bash
kubectl describe pod <pod-name> -n civicbirth-prod
kubectl logs <pod-name> -n civicbirth-prod
```

### Database connection error?
```bash
# Check environment variables
kubectl get configmap -n civicbirth-prod -o yaml
kubectl get secret -n civicbirth-prod -o yaml | grep -i database

# Test database connection
kubectl exec -it <backend-pod> -- bash
psql $DATABASE_URL -c "SELECT version();"
```

### Ingress not working?
```bash
# Check ingress status
kubectl describe ingress -n civicbirth-prod

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx <ingress-pod>
```

### Load balancer not routing traffic?
```bash
# Check target groups in AWS Console
# Verify security groups allow inbound 80/443
# Check ALB listeners configuration

# From Terraform:
terraform output alb_arn
```

---

## Scaling & Performance

### Horizontal Scaling (Add Pods)

```bash
# Edit deployment
kubectl scale deployment backend -n civicbirth-prod --replicas=5

# Or use Horizontal Pod Autoscaler (HPA)
kubectl autoscale deployment backend -n civicbirth-prod --min=2 --max=10 --cpu-percent=80
```

### Vertical Scaling (Increase Resources)

```bash
# Edit resource limits in K8s manifests
kubectl set resources deployment backend \
  -n civicbirth-prod \
  --limits=cpu=2,memory=2Gi \
  --requests=cpu=1,memory=1Gi
```

### Database Scaling

```bash
# In AWS Console:
# - RDS → Modify DB Instance → Change instance class
# - Increase allocated storage (auto-scaling enabled)
```

---

## Backup & Disaster Recovery

### Database Backups

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier civicbirth-postgres \
  --db-snapshot-identifier civicbirth-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier civicbirth-postgres
```

### Backup Verification

```bash
# Test restore to a different instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier civicbirth-postgres-test \
  --db-snapshot-identifier civicbirth-backup-20240605
```

---

## Cost Optimization

### Reduce Costs

1. **Dev Environment:**
   - Instance type: `t3.medium` (instead of `t3.large`)
   - Database: `db.t3.micro` (instead of `db.t3.small`)
   - Auto-scaling: min=1, max=2

2. **Turn off when not using:**
   ```bash
   # Scale down to 0 nodes
   terraform apply -var="min_node_count=0" -var="desired_node_count=0"
   ```

3. **Use Reserved Instances:**
   - AWS Reserved Instances save 30-40%
   - Requires 1-3 year commitment

### Cost Monitoring

```bash
# Use CloudWatch insights
aws cloudwatch get-metric-statistics \
  --namespace AWS/EKS \
  --metric-name CPUUtilization \
  --statistics Average \
  --start-time 2024-06-01T00:00:00Z \
  --end-time 2024-06-05T00:00:00Z \
  --period 86400
```

---

## Cleanup

### Destroy Infrastructure (CAUTION!)

```bash
# WARNING: This will delete everything!
cd infrastructure/terraform/aws

# See what will be deleted
terraform plan -destroy

# Delete all resources
terraform destroy
```

---

## Next Steps

1. ✅ Infrastructure deployed
2. ✅ Application running
3. ⬜ Set up monitoring alerts
4. ⬜ Configure log aggregation
5. ⬜ Set up CI/CD pipeline (Jenkins)
6. ⬜ Load testing
7. ⬜ Security audit
8. ⬜ Performance optimization

---

## Support & Documentation

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform AWS Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [CivicBirth API Documentation](../API_DOCS.md)
- [Architecture Documentation](./ARCHITECTURE.md)

---

**Last Updated:** 2026-06-05  
**Time to Complete:** ~60-90 minutes (first deployment)
