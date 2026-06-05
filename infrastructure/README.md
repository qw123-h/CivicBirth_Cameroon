# Infrastructure Directory Guide

This directory contains all infrastructure-as-code files for deploying and managing CivicBirth.

---

## Directory Structure

```
infrastructure/
├── README.md (this file)
├── QUICKSTART.md - Start here! Step-by-step deployment guide
├── DEPLOYMENT_CHECKLIST.md - Detailed checklist for deployment verification
├── terraform/
│   └── aws/ - AWS infrastructure provisioning
│       ├── provider.tf - AWS provider configuration
│       ├── vpc.tf - VPC, subnets, security groups
│       ├── eks.tf - Kubernetes cluster configuration
│       ├── rds.tf - PostgreSQL database setup
│       ├── load_balancer.tf - Application load balancer
│       ├── variables.tf - Input variables
│       ├── outputs.tf - Output values
│       └── terraform.tfvars.example - Configuration template
└── ansible/
    ├── README.md - Ansible-specific instructions
    ├── ansible.cfg - Ansible configuration
    ├── inventory/
    │   └── hosts.ini - Server inventory
    ├── playbooks/
    │   ├── setup-kubernetes.yml - Install Docker & K8s tools
    │   ├── setup-firewall.yml - Configure UFW & security
    │   └── deploy-app.yml - Deploy application to K8s
    └── templates/
        └── daemon.json.j2 - Docker daemon config template
```

---

## Quick Start

### For First-Time Deployers

1. **Read:** [QUICKSTART.md](./QUICKSTART.md) (15 min read)
2. **Prepare:** Gather all required information
3. **Deploy:** Follow 7 phases step-by-step
4. **Verify:** Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Time Estimates

- **Total Deployment Time:** 60-90 minutes
- **Phase 1 (Terraform):** 15-20 min
- **Phase 2 (Kubeconfig):** 5 min
- **Phase 3 (Ansible):** 20-30 min
- **Phase 4 (Deploy App):** 15-20 min
- **Phase 5 (DNS/SSL):** 10-20 min

---

## Deployment Flowchart

```
START
  │
  ├─→ [Prerequisites] ──→ [Setup AWS Account]
  │                       [Install Tools]
  │
  ├─→ [Phase 1] Terraform Infrastructure
  │   ├─→ terraform init
  │   ├─→ terraform plan
  │   ├─→ terraform apply
  │   └─→ Save outputs
  │
  ├─→ [Phase 2] Configure Kubernetes
  │   ├─→ Update kubeconfig
  │   └─→ Verify cluster health
  │
  ├─→ [Phase 3] Ansible Configuration
  │   ├─→ Setup inventory
  │   ├─→ Install Docker & K8s tools
  │   └─→ Configure firewall
  │
  ├─→ [Phase 4] Deploy Application
  │   ├─→ Create secrets
  │   ├─→ Deploy via Ansible
  │   └─→ Verify pods running
  │
  ├─→ [Phase 5] DNS & Load Balancer
  │   ├─→ Configure DNS
  │   ├─→ Setup SSL/TLS
  │   └─→ Verify HTTPS
  │
  └─→ [Post-Deployment] 
      ├─→ Run verification checks
      ├─→ Setup monitoring
      ├─→ Document findings
      └─→ DONE ✓
```

---

## Core Components

### 1. Terraform (Infrastructure as Code)

**Location:** `terraform/aws/`

Terraform provisions cloud infrastructure:
- **EKS Cluster** - Managed Kubernetes
- **RDS Database** - PostgreSQL 15
- **Load Balancer** - AWS Application Load Balancer
- **VPC & Networking** - Isolated network with public/private subnets
- **Security Groups** - Firewall rules
- **IAM Roles** - Permissions and access control

**Key Files:**
- `provider.tf` - AWS configuration
- `vpc.tf` - Network infrastructure
- `eks.tf` - Kubernetes cluster
- `rds.tf` - Database setup
- `load_balancer.tf` - Load balancer
- `variables.tf` - Configuration inputs
- `outputs.tf` - Exported values

**Usage:**
```bash
cd terraform/aws
terraform init        # Initialize
terraform plan        # Preview changes
terraform apply       # Deploy infrastructure
```

### 2. Ansible (Configuration Management)

**Location:** `ansible/`

Ansible configures servers after Terraform creates them:
- **install-kubernetes.yml** - Docker, kubectl, kubelet
- **setup-firewall.yml** - UFW, security rules, monitoring
- **deploy-app.yml** - Kubernetes manifests deployment

**Key Files:**
- `inventory/hosts.ini` - Server inventory
- `playbooks/*.yml` - Automation scripts
- `ansible.cfg` - Configuration
- `README.md` - Detailed Ansible guide

**Usage:**
```bash
cd ansible
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml
```

### 3. Kubernetes Manifests

**Location:** `../k8s/` (sibling directory)

Pre-configured Kubernetes resources:
- `namespace.yaml` - Create namespaces
- `configmap.yaml` - Application configuration
- `secret.yaml` - Sensitive data
- `backend.yaml` - Backend API deployment
- `frontend.yaml` - Frontend web app
- `postgres.yaml` - Database deployment
- `ingress.yaml` - Ingress controller rules
- `policies.yaml` - Network and security policies
- `rbac.yaml` - Role-based access control

---

## Prerequisites

### Local Machine Setup

```bash
# AWS CLI
aws --version  # v2.0+
aws configure  # Set credentials

# Terraform
terraform --version  # v1.0+

# Kubernetes
kubectl version  # v1.28+
helm version     # v3.10+

# Ansible
ansible --version  # v2.10+

# SSH
ssh-keygen -t rsa -f ~/.ssh/civicbirth.pem

# Docker (optional, for testing locally)
docker --version  # v20.10+
```

### AWS Account Setup

- [ ] AWS account created
- [ ] IAM user with appropriate permissions
- [ ] Access key and secret created
- [ ] AWS CLI configured: `aws configure`
- [ ] Sufficient EC2/EKS quota in target region
- [ ] Budget alerts configured

### Network Requirements

- [ ] Domain name registered
- [ ] DNS access available
- [ ] SSL/TLS certificate path planned
- [ ] SMTP server for email alerts (optional)
- [ ] VPN or secure connection to infrastructure

---

## Configuration Files

### Terraform Variables (`terraform/aws/terraform.tfvars`)

Copy from `terraform.tfvars.example` and customize:

```hcl
aws_region = "us-east-1"
environment = "production"
cluster_name = "civicbirth-eks"
instance_type = "t3.large"
db_password = "YOUR_STRONG_PASSWORD"
# ... more variables
```

### Ansible Inventory (`ansible/inventory/hosts.ini`)

Update with your server IPs:

```ini
[production]
civicbirth-main ansible_host=YOUR_IP ansible_user=ubuntu
```

---

## Security Considerations

### Network Security
- VPC with public and private subnets
- Security groups restrict traffic by source/port
- NAT gateway for private subnet egress
- Network policies enforce pod-to-pod communication

### Access Control
- IAM roles with least privilege
- RBAC for Kubernetes
- SSH key authentication (no passwords)
- Fail2Ban for brute-force protection

### Data Protection
- RDS encryption at rest
- Database backups automated
- SSL/TLS for all traffic
- Secrets manager for sensitive data
- Audit logging enabled

### Compliance
- VPC Flow Logs for network monitoring
- CloudTrail for API audit
- CloudWatch alarms for anomalies
- Regular security scanning

---

## Monitoring & Observability

### Infrastructure Monitoring
```bash
# CloudWatch metrics
aws cloudwatch get-metric-statistics --namespace AWS/EKS \
  --metric-name CPUUtilization --statistics Average
```

### Application Monitoring
```bash
# Prometheus & Grafana (optional, deploy after infrastructure)
kubectl apply -f https://github.com/prometheus-operator/prometheus-operator/releases/download/v0.60.0/bundle.yaml
```

### Logging
```bash
# View logs
kubectl logs -f deployment/backend -n civicbirth-prod

# CloudWatch logs
aws logs tail /aws/eks/civicbirth-eks/cluster --follow
```

---

## Scaling

### Horizontal Scaling (More Pods)
```bash
kubectl scale deployment backend -n civicbirth-prod --replicas=5
```

### Vertical Scaling (Bigger Pods)
```bash
kubectl set resources deployment backend \
  --limits=cpu=2,memory=2Gi \
  --requests=cpu=1,memory=1Gi
```

### Node Scaling (More Servers)
```bash
# Via Terraform
terraform apply -var="desired_node_count=4"

# Via AWS Auto Scaling
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name civicbirth-asg \
  --desired-capacity 4
```

---

## Maintenance & Updates

### Regular Tasks

**Weekly:**
- [ ] Check CloudWatch alarms
- [ ] Review logs for errors
- [ ] Monitor cost usage

**Monthly:**
- [ ] Update Docker base images
- [ ] Update Kubernetes patches
- [ ] Review security group rules
- [ ] Test backup restoration

**Quarterly:**
- [ ] Major version updates
- [ ] Security audit
- [ ] Performance optimization
- [ ] Disaster recovery drill

### Backup & Recovery

```bash
# Database backup
aws rds create-db-snapshot --db-instance-identifier civicbirth-postgres \
  --db-snapshot-identifier civicbirth-backup-$(date +%Y%m%d)

# Kubernetes state backup
kubectl get all -A -o yaml > k8s-backup-$(date +%Y%m%d).yaml

# Terraform state backup
cp terraform.tfstate terraform.tfstate.backup
```

---

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n civicbirth-prod
kubectl logs <pod-name> -n civicbirth-prod
```

**Database connection error:**
```bash
kubectl get secret civicbirth-secret -n civicbirth-prod -o yaml
kubectl exec -it <pod> -- psql $DATABASE_URL
```

**DNS not resolving:**
```bash
nslookup civicbirth.yourdomain.com
dig civicbirth.yourdomain.com +trace
```

**Load balancer not routing:**
```bash
kubectl get ingress -n civicbirth-prod
kubectl describe ingress -n civicbirth-prod
```

See [QUICKSTART.md](./QUICKSTART.md#troubleshooting) for more solutions.

---

## Cost Estimation (AWS)

### Production Setup
| Component | Cost/Month |
|-----------|-----------|
| EKS Control Plane | $73 |
| EC2 Nodes (t3.large x2) | $60 |
| RDS PostgreSQL (db.t3.small) | $80 |
| Load Balancer | $20 |
| Data Transfer | $100 |
| **Total** | **~$330** |

### Development Setup (Reduced)
| Component | Cost/Month |
|-----------|-----------|
| EKS Control Plane | $73 |
| EC2 Nodes (t3.medium x1) | $30 |
| RDS PostgreSQL (db.t3.micro) | $40 |
| Load Balancer | $20 |
| Data Transfer | $20 |
| **Total** | **~$180** |

---

## Related Documentation

- [Main Infrastructure Guide](../docs/INFRASTRUCTURE.md)
- [Architecture Document](../docs/ARCHITECTURE.md)
- [Kubernetes Manifests](../k8s/)
- [Application API Documentation](../docs/API_DOCS.md)
- [Project README](../README.md)

---

## Support & Resources

### Documentation
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Ansible Documentation](https://docs.ansible.com/)
- [AWS Documentation](https://docs.aws.amazon.com/)

### Community
- [Terraform Community](https://discuss.hashicorp.com/c/terraform/)
- [Kubernetes Community](https://kubernetes.io/community/)
- [Ansible Community](https://www.ansible.com/community)

### Tools & Services
- [Terraform Cloud](https://www.terraform.io/cloud) - Managed state storage
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation
- [DataDog](https://www.datadoghq.com/) - Monitoring SaaS
- [PagerDuty](https://www.pagerduty.com/) - Incident management

---

## Feedback & Improvements

Found an issue? Have a suggestion?

1. Check existing documentation and troubleshooting guides
2. Search GitHub issues: [CivicBirth Issues](https://github.com/qw123-h/CivicBirth_Cameroon/issues)
3. Create a new issue with:
   - What you were trying to do
   - Error message or unexpected behavior
   - Steps to reproduce
   - Your environment (OS, tool versions, etc.)

---

## Change Log

### Version 1.0 (2026-06-05)
- Initial infrastructure setup for CivicBirth
- Terraform configuration for AWS EKS
- Ansible playbooks for configuration management
- Complete deployment guide and checklist

---

**Last Updated:** 2026-06-05  
**Maintainer:** CivicBirth Development Team  
**License:** Same as main project
