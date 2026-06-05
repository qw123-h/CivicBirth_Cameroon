# Infrastructure Deployment Checklist

## Pre-Deployment Phase

### Prerequisites
- [ ] AWS account with sufficient quota
- [ ] Terraform >= 1.0 installed and configured
- [ ] AWS CLI v2 installed and configured (`aws configure`)
- [ ] Ansible >= 2.10 installed
- [ ] kubectl >= 1.28 installed
- [ ] Helm >= 3.10 installed
- [ ] SSH key pair generated (`ssh-keygen -t rsa`)
- [ ] Domain name registered and accessible
- [ ] SSL/TLS certificate ready (or Let's Encrypt email)

### Team Preparation
- [ ] All team members have AWS IAM access
- [ ] SSH public keys distributed to team
- [ ] Communication channel established (Slack/Teams)
- [ ] Deployment plan reviewed by team
- [ ] Rollback plan understood
- [ ] Stakeholder approvals obtained

### Configuration Review
- [ ] All environment variables defined
- [ ] Database credentials secured
- [ ] JWT secret generated (min 64 characters)
- [ ] API keys for external services ready
- [ ] Email/SMTP configuration ready
- [ ] Supabase bucket configured
- [ ] Backup strategy defined

---

## Phase 1: Terraform Infrastructure (Timeline: 15-20 min)

### 1.1 Terraform Initialization
- [ ] Navigate to `infrastructure/terraform/aws/`
- [ ] Copy `terraform.tfvars.example` to `terraform.tfvars`
- [ ] Update `terraform.tfvars` with environment-specific values
- [ ] Review all variables for correctness
- [ ] Run `terraform init`
- [ ] Run `terraform validate` (should return no errors)

### 1.2 Plan Phase
- [ ] Run `terraform plan -out=tfplan`
- [ ] Review plan output for:
  - [ ] 1 EKS cluster
  - [ ] 1 Auto Scaling Group with 2 nodes
  - [ ] 1 RDS PostgreSQL instance
  - [ ] 1 Application Load Balancer
  - [ ] VPC, subnets, security groups
  - [ ] No resource deletions (unless intended)
- [ ] Get sign-off on plan from team lead

### 1.3 Apply Phase
- [ ] Run `terraform apply tfplan`
- [ ] Monitor progress (should complete in ~20 min)
- [ ] Verify no errors in output
- [ ] Save output to file: `terraform output > deployment-outputs.txt`
- [ ] Extract and document:
  - [ ] EKS cluster endpoint
  - [ ] RDS endpoint
  - [ ] Load balancer DNS name
  - [ ] Database credentials secret ARN

### 1.4 Post-Apply Verification
- [ ] All resources created: `aws ec2 describe-instances --region us-east-1`
- [ ] EKS cluster active: `aws eks describe-cluster --name civicbirth-eks`
- [ ] RDS instance available: `aws rds describe-db-instances`
- [ ] Security groups configured correctly
- [ ] IAM roles and policies attached

---

## Phase 2: Kubernetes Configuration (Timeline: 5-10 min)

### 2.1 Kubeconfig Setup
- [ ] Get kubeconfig command from Terraform output
- [ ] Run: `aws eks update-kubeconfig --name civicbirth-eks --region us-east-1`
- [ ] Verify: `kubectl cluster-info`
- [ ] Verify: `kubectl get nodes` (should show 2 nodes)

### 2.2 Cluster Health Check
- [ ] All nodes ready: `kubectl get nodes` (Status = Ready)
- [ ] All system pods running: `kubectl get pods -A`
  - [ ] No pending pods
  - [ ] No failed pods
  - [ ] No restarting pods
- [ ] Cluster can schedule pods: `kubectl run test-pod --image=nginx`
- [ ] Clean up test pod: `kubectl delete pod test-pod`

### 2.3 Storage Configuration
- [ ] Check persistent volume classes: `kubectl get sc`
- [ ] Verify storage provisioner exists
- [ ] Test PVC creation if needed

---

## Phase 3: Ansible Configuration (Timeline: 20-30 min)

### 3.1 Inventory Preparation
- [ ] Navigate to `infrastructure/ansible/`
- [ ] Get EKS node IPs: `kubectl get nodes -o wide`
- [ ] Update `inventory/hosts.ini`:
  - [ ] Replace example IPs with actual node IPs
  - [ ] Verify SSH key path is correct
  - [ ] Set correct ansible_user (ubuntu)
- [ ] Test SSH connectivity: `ansible all -i inventory/hosts.ini -m ping`

### 3.2 Security Playbook Review
- [ ] Edit `playbooks/setup-firewall.yml`
- [ ] Update `allowed_ssh_ips` with your IP: `curl https://ifconfig.me`
- [ ] Review firewall rules for appropriateness
- [ ] Coordinate with network team if needed

### 3.3 Kubernetes Setup Playbook
- [ ] Syntax check: `ansible-playbook playbooks/setup-kubernetes.yml --syntax-check`
- [ ] Dry run: `ansible-playbook playbooks/setup-kubernetes.yml --check`
- [ ] Review output for any issues
- [ ] Execute: `ansible-playbook playbooks/setup-kubernetes.yml -v`
- [ ] Verify installation:
  - [ ] `ansible all -i inventory/hosts.ini -m shell -a "docker --version"`
  - [ ] `ansible all -i inventory/hosts.ini -m shell -a "kubectl version --client"`

### 3.4 Firewall Setup Playbook
- [ ] Execute: `ansible-playbook playbooks/setup-firewall.yml -v`
- [ ] Verify firewall rules: `ansible all -i inventory/hosts.ini -m shell -a "sudo ufw status"`
- [ ] Test SSH still works (critical!)
- [ ] Document firewall rules for team

---

## Phase 4: Application Deployment (Timeline: 15-20 min)

### 4.1 Secret & Configuration Preparation
- [ ] Generate database password (min 16 chars, include symbols)
- [ ] Generate JWT secret (min 64 chars)
- [ ] Gather API keys:
  - [ ] Supabase URL and service key
  - [ ] SMTP credentials (for alerts)
  - [ ] Any other external service keys
- [ ] Test database password requirements with RDS
- [ ] Document all secrets in secure location (vault/lastpass)

### 4.2 Deploy via Ansible
- [ ] Review `playbooks/deploy-app.yml` for appropriateness
- [ ] Set environment variables:
  ```bash
  export DB_PASSWORD="your-password"
  export JWT_SECRET="your-secret"
  export SUPABASE_URL="https://xxx.supabase.co"
  export SUPABASE_SERVICE_KEY="key"
  ```
- [ ] Execute deployment:
  ```bash
  ansible-playbook playbooks/deploy-app.yml \
    -e "database_url=postgresql://postgres:${DB_PASSWORD}@..." \
    -e "jwt_secret=${JWT_SECRET}" \
    -v
  ```
- [ ] Monitor execution for errors

### 4.3 Kubernetes Deployment Verification
- [ ] Check namespace created: `kubectl get ns civicbirth-prod`
- [ ] Check all pods: `kubectl get pods -n civicbirth-prod`
  - [ ] PostgreSQL pod running
  - [ ] Backend pod running (replicas: 2)
  - [ ] Frontend pod running (replicas: 2)
  - [ ] No pods in error state
- [ ] Check pod readiness: `kubectl get pods -n civicbirth-prod -o wide`
- [ ] Check pod logs for errors:
  - [ ] `kubectl logs -f deployment/backend -n civicbirth-prod`
  - [ ] `kubectl logs -f deployment/frontend -n civicbirth-prod`
- [ ] Check services: `kubectl get svc -n civicbirth-prod`
- [ ] Check ingress: `kubectl get ingress -n civicbirth-prod`

### 4.4 Application Health Check
- [ ] Backend health endpoint:
  ```bash
  kubectl port-forward svc/backend 3000:3000 -n civicbirth-prod
  curl http://localhost:3000/health
  ```
- [ ] Database connectivity:
  ```bash
  kubectl logs deployment/backend -n civicbirth-prod | grep -i database
  ```
- [ ] Frontend accessibility:
  ```bash
  kubectl port-forward svc/frontend 5173:80 -n civicbirth-prod
  # Visit http://localhost:5173 in browser
  ```
- [ ] API endpoints respond (check HTTP status codes)

---

## Phase 5: Load Balancer & DNS (Timeline: 10-20 min)

### 5.1 Load Balancer Configuration
- [ ] Get ALB DNS name: `terraform output alb_dns_name`
- [ ] Verify ALB created: `aws elbv2 describe-load-balancers`
- [ ] Check target groups healthy: `aws elbv2 describe-target-health --target-group-arn <arn>`
- [ ] Test ALB with curl:
  ```bash
  curl -v http://<alb-dns-name>/health
  ```

### 5.2 DNS Configuration
- [ ] Domain registrar access verified
- [ ] Create CNAME record:
  - [ ] Name: `civicbirth.yourdomain.com`
  - [ ] Value: ALB DNS name (from above)
- [ ] Wait for DNS propagation (5-30 min):
  ```bash
  nslookup civicbirth.yourdomain.com
  ```
- [ ] Verify DNS resolves to ALB:
  ```bash
  dig civicbirth.yourdomain.com
  ```

### 5.3 SSL/TLS Certificate Setup

**Option A: Let's Encrypt (Automated)**
- [ ] Install cert-manager:
  ```bash
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
  ```
- [ ] Create ClusterIssuer
- [ ] Update ingress to use TLS
- [ ] Wait for certificate issuance (2-5 min)

**Option B: AWS ACM**
- [ ] Create certificate via AWS Console
- [ ] Validate domain ownership (DNS or email)
- [ ] Update ALB listener with certificate ARN
- [ ] Update ingress annotations

### 5.4 HTTPS Verification
- [ ] Test HTTPS:
  ```bash
  curl -v https://civicbirth.yourdomain.com/health
  ```
- [ ] Check certificate validity:
  ```bash
  openssl s_client -connect civicbirth.yourdomain.com:443
  ```
- [ ] Check browser access (no warnings)
- [ ] Verify certificate details:
  - [ ] Correct domain
  - [ ] Not expired
  - [ ] Issued by trusted CA

---

## Phase 6: Monitoring & Logging (Optional)

### 6.1 Prometheus Setup
- [ ] Add Prometheus Helm repo
- [ ] Install kube-prometheus-stack
- [ ] Verify Prometheus scraping targets

### 6.2 Grafana Setup
- [ ] Access Grafana dashboard
- [ ] Change default credentials
- [ ] Create dashboards for:
  - [ ] Kubernetes cluster metrics
  - [ ] Application performance
  - [ ] Database metrics
  - [ ] Pod resource usage

### 6.3 Logging Configuration
- [ ] Configure CloudWatch log retention
- [ ] Set up log aggregation (optional: ELK/Loki)
- [ ] Configure log alerts for errors

---

## Phase 7: Post-Deployment Verification

### 7.1 Functional Testing
- [ ] Backend API responds: `curl https://civicbirth.yourdomain.com/health`
- [ ] Frontend loads: Open in browser
- [ ] Database accessible: Check backend logs
- [ ] All routes accessible:
  - [ ] `/health` - Health check
  - [ ] `/api/agents` - API endpoint
  - [ ] `/login` - Auth page
  - [ ] Public pages load

### 7.2 Security Verification
- [ ] SSL/TLS certificate valid and trusted
- [ ] HTTP redirects to HTTPS
- [ ] Security headers present:
  - [ ] HSTS header
  - [ ] X-Content-Type-Options
  - [ ] X-Frame-Options
  - [ ] CSP header
- [ ] Firewall rules active: `ufw status`
- [ ] SSH access restricted: Check fail2ban logs

### 7.3 Database Verification
- [ ] Connection pool status healthy
- [ ] Migrations executed successfully
- [ ] Sample queries return data
- [ ] Backup scheduled and working

### 7.4 Performance Baseline
- [ ] Response time baseline measured
- [ ] Database query performance acceptable
- [ ] Memory usage baseline established
- [ ] CPU usage baseline established

---

## Phase 8: Documentation & Handoff

### 8.1 Documentation
- [ ] Deployment guide completed
- [ ] Architecture diagram updated
- [ ] Network topology documented
- [ ] Runbook for common tasks created
- [ ] Troubleshooting guide created
- [ ] Disaster recovery procedure documented

### 8.2 Team Handoff
- [ ] Operations team trained on:
  - [ ] Kubectl commands
  - [ ] Viewing logs
  - [ ] Scaling deployments
  - [ ] Emergency procedures
- [ ] Documentation provided:
  - [ ] Terraform state backup procedure
  - [ ] Kubernetes backup strategy
  - [ ] Database backup/restore procedure
- [ ] Access credentials distributed securely
- [ ] Escalation procedures documented

### 8.3 Monitoring & Alerting
- [ ] Ops team has Grafana access
- [ ] Alert notifications configured
- [ ] Alert recipients notified
- [ ] On-call schedule established
- [ ] Incident response procedure reviewed

---

## Phase 9: Optimization & Hardening (Post-Deployment)

### 9.1 Performance Optimization
- [ ] Database query optimization
- [ ] API response time optimization
- [ ] Frontend asset optimization
- [ ] CDN configuration (if needed)

### 9.2 Security Hardening
- [ ] Vulnerability scan completed
- [ ] Network policies configured
- [ ] Pod security policies enforced
- [ ] Secret rotation schedule established
- [ ] Regular security audits scheduled

### 9.3 Cost Optimization
- [ ] Right-sizing instances evaluated
- [ ] Reserved instances considered
- [ ] Auto-scaling policies reviewed
- [ ] Unused resources removed
- [ ] Cost monitoring dashboard created

---

## Rollback Procedure (If Issues Arise)

### Emergency Rollback

```bash
# Revert Kubernetes deployments
kubectl rollout undo deployment/backend -n civicbirth-prod
kubectl rollout undo deployment/frontend -n civicbirth-prod

# Check deployment status
kubectl rollout status deployment/backend -n civicbirth-prod

# If that fails, delete and redeploy from backup
kubectl delete deployment backend -n civicbirth-prod
kubectl apply -f k8s/backend.yaml
```

### Infrastructure Rollback

```bash
# CAUTION: Only if infrastructure needs to be destroyed

# Option 1: Scale down gracefully
terraform apply -var="min_node_count=0" -var="desired_node_count=0"

# Option 2: Destroy everything (CAREFUL!)
terraform destroy -auto-approve
```

---

## Sign-Off

- [ ] **Deployed By:** _________________  
- [ ] **Date:** _________________  
- [ ] **Verified By:** _________________  
- [ ] **Ops Team Lead:** _________________  
- [ ] **Project Manager:** _________________  

---

## Post-Deployment Notes

```
[Space for deployment team to add notes, issues encountered, and resolutions]
```

---

**Last Updated:** 2026-06-05  
**Version:** 1.0  
**Estimated Time:** 60-90 minutes
