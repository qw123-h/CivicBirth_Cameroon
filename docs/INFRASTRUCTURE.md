# Infrastructure Setup Documentation

## 1. Overview

The CivicBirth system is a multi-tier application designed to run on Kubernetes with the following components:

- **Frontend:** React-based web application
- **Backend:** Node.js REST API with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** Supabase (for certificate storage)
- **Monitoring:** Prometheus + Grafana
- **Orchestration:** Kubernetes (managed or self-hosted)
- **CI/CD:** Jenkins or GitHub Actions

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet Users                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Cloud Load Balancer                          │
│              (AWS ALB / GCP Load Balancer)                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  Kubernetes Cluster                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Ingress Controller                     │  │
│  │          (NGINX / AWS ALB Ingress Controller)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│      ┌───────────────────┼───────────────────┐                │
│      │                   │                   │                │
│  ┌───▼────┐          ┌───▼────┐         ┌───▼────┐           │
│  │Frontend │          │Backend │         │Postgres│           │
│  │Service  │          │Service │         │Service │           │
│  │Port 80  │          │Port 3000         │Port 5432           │
│  └────┬────┘          └────┬───┘         └────┬───┘           │
│       │                    │                  │                │
│  ┌────▼─────────┐   ┌──────▼──────┐   ┌──────▼──────┐        │
│  │Frontend Pod  │   │Backend Pod 1 │   │Postgres Pod│        │
│  │Replicas: 2   │   │Backend Pod 2 │   │(Primary)   │        │
│  └──────────────┘   └──────────────┘   └────────────┘        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Persistent Volumes                         │  │
│  │        (PostgreSQL Data Storage - 50GB+)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Monitoring Stack (Logging Namespace)           │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Prometheus  │  │ Grafana  │  │ Loki     │           │  │
│  │  │ (Metrics)   │  │(Dashbrd) │  │ (Logs)   │           │  │
│  │  └─────────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              External Services                                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Supabase Storage│  │ DNS Service  │  │ SMTP Server  │      │
│  │ (Certificates)  │  │ (Route 53)   │  │ (Email Alerts│      │
│  └─────────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. System Requirements

### 3.1 Compute Resources

**Minimum Configuration (Development):**
- CPU: 2 vCPUs
- RAM: 4 GB
- Storage: 50 GB (OS + Applications)
- Database Storage: 50 GB (PostgreSQL)

**Recommended Configuration (Production):**
- CPU: 4-8 vCPUs
- RAM: 16-32 GB
- Storage: 100+ GB (OS + Applications)
- Database Storage: 500+ GB (PostgreSQL with backups)

### 3.2 Network Requirements

- **Bandwidth:** 100 Mbps minimum upstream/downstream
- **Redundancy:** Multi-zone deployment (if using managed K8s)
- **DNS:** Custom domain with SSL/TLS certificate
- **Firewall:** Restricted inbound traffic (see section 3.4)

### 3.3 Software Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Kubernetes | 1.28+ | Container orchestration |
| Docker | 20.10+ | Container runtime |
| PostgreSQL | 15+ | Relational database |
| Node.js | 18+ | Backend runtime |
| React | 18+ | Frontend framework |
| Prometheus | 2.40+ | Monitoring |
| Grafana | 9.0+ | Visualization |
| Jenkins | 2.400+ | CI/CD pipeline |
| Ansible | 2.13+ | Infrastructure automation |

### 3.4 Firewall Rules

| Rule | Protocol | Port(s) | Source | Purpose |
|------|----------|---------|--------|---------|
| Ingress HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic (redirects to 443) |
| Ingress HTTPS | TCP | 443 | 0.0.0.0/0 | Encrypted web traffic |
| SSH | TCP | 22 | Admin IP | Server management |
| PostgreSQL | TCP | 5432 | K8s Internal | Database access |
| Prometheus Scrape | TCP | 9090 | K8s Monitoring Subnet | Metrics collection |
| Jenkins | TCP | 8080 | Admin IP | CI/CD access |
| Kubernetes API | TCP | 6443 | K8s Nodes | Cluster management |
| Egress SMTP | TCP | 587 | External SMTP | Email alerts |

---

## 4. Deployment Options

### 4.1 Option A: Cloud-Managed Kubernetes (Recommended for Production)

**AWS EKS:**
- Managed Kubernetes service
- Auto-scaling nodes
- VPC networking
- RDS for PostgreSQL (optional)
- Estimated cost: $70-150/month (compute)

**Google Cloud GKE:**
- Similar to EKS
- Better free tier
- Integrated monitoring with Stackdriver
- Estimated cost: $50-100/month (compute)

**Azure AKS:**
- Good for Microsoft stack
- Enterprise support
- Cost: $60-120/month (compute)

### 4.2 Option B: Self-Hosted Kubernetes (Cost-effective)

- DigitalOcean App Platform
- Linode Kubernetes Engine
- Hetzner Cloud
- Self-managed on VPS (requires operational expertise)

### 4.3 Option C: Traditional VPS (Simplest, No Kubernetes)

- Deploy using Docker Compose
- Single server or multiple servers
- Manual scaling
- Suitable for low-traffic scenarios

---

## 5. Infrastructure as Code Approach

We provide three types of Infrastructure as Code:

### 5.1 Terraform (Cloud Infrastructure)

Deploy to AWS, GCP, or Azure:
- Creates VPC, subnets, security groups
- Provisions Kubernetes cluster
- Sets up database (RDS/Cloud SQL)
- Configures load balancers

**Location:** `/infrastructure/terraform/`

### 5.2 Kubernetes Manifests (Application Deployment)

Deploy applications on existing K8s cluster:
- Namespace creation
- Deployments for frontend/backend
- Services and Ingress
- ConfigMaps and Secrets
- Persistent volumes

**Location:** `/k8s/`

### 5.3 Ansible (Configuration Management)

Automate infrastructure setup:
- Install Docker, Kubernetes tools
- Configure firewall rules
- Set up monitoring agents
- Deploy applications

**Location:** `/infrastructure/ansible/`

---

## 6. Step-by-Step Deployment

### 6.1 Prerequisites

```bash
# Install required tools
- aws-cli (for AWS) / gcloud (for GCP) / az (for Azure)
- kubectl
- helm
- terraform
- ansible

# Have credentials ready
- Cloud provider API keys
- GitHub tokens (for private registries)
- SSH keys
```

### 6.2 Phase 1: Infrastructure Provisioning

```bash
# Using Terraform (AWS example)
cd infrastructure/terraform/aws
terraform init
terraform plan
terraform apply

# Output:
# - Kubernetes cluster endpoint
# - Database connection string
# - Load balancer DNS
```

### 6.3 Phase 2: Kubernetes Setup

```bash
# Configure kubectl
aws eks update-kubeconfig --name civicbirth --region us-east-1

# Create namespaces
kubectl apply -f k8s/namespace.yaml

# Deploy monitoring stack (optional)
kubectl apply -f k8s/monitoring/

# Verify cluster
kubectl get nodes
kubectl get pods --all-namespaces
```

### 6.4 Phase 3: Database Setup

```bash
# Apply database manifests
kubectl apply -f k8s/postgres.yaml

# Or use managed database (RDS/Cloud SQL)
# Connection string in ConfigMap

# Run migrations
kubectl exec -it <postgres-pod> -- psql -U postgres -d civicbirth
```

### 6.5 Phase 4: Deploy Application

```bash
# Create secrets
kubectl apply -f k8s/secret.yaml

# Create ConfigMaps
kubectl apply -f k8s/configmap.yaml

# Deploy backend
kubectl apply -f k8s/backend.yaml

# Deploy frontend
kubectl apply -f k8s/frontend.yaml

# Set up Ingress
kubectl apply -f k8s/ingress.yaml
```

### 6.6 Phase 5: Setup CI/CD

```bash
# Install Jenkins (optional)
# Configure GitHub webhook
# Setup build pipelines

# Or use GitHub Actions (simpler)
```

### 6.7 Phase 6: Monitoring & Logging

```bash
# Deploy Prometheus & Grafana
kubectl apply -f k8s/monitoring/

# Access Grafana at http://<load-balancer>/grafana
# Import dashboards from k8s/monitoring/dashboards/
```

---

## 7. Production Checklist

- [ ] SSL/TLS certificate configured (Let's Encrypt)
- [ ] Database backups scheduled (daily)
- [ ] Monitoring alerts configured
- [ ] Log aggregation setup
- [ ] Auto-scaling policies defined
- [ ] Disaster recovery plan tested
- [ ] Load testing completed
- [ ] Security scan completed (OWASP)
- [ ] RBAC policies enforced
- [ ] Network policies configured (Calico/Weave)
- [ ] Pod security policies set
- [ ] Resource quotas defined per namespace

---

## 8. Estimated Costs (Monthly - AWS)

| Component | Quantity | Cost |
|-----------|----------|------|
| EKS Control Plane | 1 | $73.00 |
| EC2 Instances (t3.large x2) | 2 | $60.00 |
| RDS PostgreSQL (db.t3.small) | 1 | $80.00 |
| Load Balancer | 1 | $20.00 |
| Elastic IPs | 2 | $1.00 |
| Data Transfer | ~1TB | $100.00 |
| **Total** | | **~$330/month** |

*Note: Costs vary based on region, instance type, and traffic patterns*

---

## 9. Troubleshooting

### Pod not starting?
```bash
kubectl describe pod <pod-name> -n civicbirth-prod
kubectl logs <pod-name> -n civicbirth-prod
```

### Database connection issues?
```bash
# Check ConfigMap/Secret
kubectl get configmap civicbirth-config -n civicbirth-prod -o yaml
kubectl get secret civicbirth-secret -n civicbirth-prod -o yaml

# Test connection
kubectl exec -it <backend-pod> -- npm run check:db
```

### Ingress not routing traffic?
```bash
# Check Ingress status
kubectl get ingress -n civicbirth-prod

# Verify DNS
nslookup civicbirth.example.com
```

---

## 10. Scaling the System

### Horizontal Scaling (Add Pods)

```yaml
# In k8s/backend.yaml
spec:
  replicas: 5  # Increase from 2 to 5
```

### Vertical Scaling (Increase Resources)

```yaml
# Update resource limits
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi
```

### Auto-scaling

```bash
# Enable Horizontal Pod Autoscaler (HPA)
kubectl autoscale deployment backend -n civicbirth-prod --min=2 --max=10 --cpu-percent=80
```

---

## 11. Disaster Recovery

### Backup Strategy

- Daily PostgreSQL backups (automated)
- Weekly full system snapshots
- Monthly backup testing

### Disaster Recovery Procedure

1. Restore PostgreSQL from latest backup
2. Redeploy Kubernetes manifests
3. Verify application connectivity
4. Run integration tests

---

## 12. Security Hardening

### Network Security

- Restrict database access to K8s pods only
- Use private subnet for databases
- Enable VPC Flow Logs
- Set up WAF rules on load balancer

### Application Security

- Enable pod security policies
- Use network policies to restrict traffic
- Regular security scanning (Trivy, Snyk)
- Update all base images monthly

### Access Control

- Use RBAC for Kubernetes
- Restrict IAM permissions by principle of least privilege
- Enable audit logging
- Use sealed secrets for sensitive data

---

## 13. Monitoring & Observability

### Key Metrics to Monitor

- Pod CPU/Memory utilization
- Database connection pool status
- API response times (p50, p95, p99)
- Error rates by endpoint
- Disk space usage

### Alerting Rules

- Pod restart rate > 5 in 1 hour
- Memory usage > 80%
- Database disk usage > 90%
- API error rate > 5%
- Deployment rollback detected

---

## 14. Related Documentation

- [Kubernetes Manifests](./k8s/)
- [CI/CD Pipeline Setup](./CI_CD.md)
- [API Documentation](./API_DOCS.md)
- [Architecture Document](./ARCHITECTURE.md)

---

**Last Updated:** 2026-06-05  
**Author:** CivicBirth Development Team
