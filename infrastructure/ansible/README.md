# Ansible Playbook Instructions

## Setup Instructions

### 1. Install Ansible
```bash
pip install ansible kubernetes
ansible-galaxy collection install community.kubernetes
```

### 2. Configure SSH Access
```bash
# Create SSH key if you don't have one
ssh-keygen -t rsa -f ~/.ssh/civicbirth.pem

# Copy public key to servers
ssh-copy-id -i ~/.ssh/civicbirth.pem ubuntu@your-server-ip

# Update inventory/hosts.ini with your server IPs
```

### 3. Update Inventory

Edit `inventory/hosts.ini` and replace:
- `ansible_host=1.2.3.4` with your actual server IP
- `ansible_ssh_private_key_file` with your SSH key path

### 4. Run Playbooks

#### Setup Kubernetes and Docker
```bash
# Syntax check
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml --syntax-check

# Dry run (see what will be changed)
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml --check

# Execute playbook
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml -v
```

#### Setup Firewall and Security
```bash
# IMPORTANT: Review allowed_ssh_ips in the playbook before running!
ansible-playbook -i inventory/hosts.ini playbooks/setup-firewall.yml --check
ansible-playbook -i inventory/hosts.ini playbooks/setup-firewall.yml -v
```

#### Deploy Application
```bash
# First ensure secrets are set in group_vars or environment variables
ansible-playbook -i inventory/hosts.ini playbooks/deploy-app.yml \
  -e "database_url=postgresql://user:pass@host:5432/civicbirth" \
  -e "jwt_secret=your-jwt-secret" \
  -v
```

## Playbook Descriptions

### setup-kubernetes.yml
Installs and configures:
- Docker & Docker Compose
- Kubernetes tools (kubelet, kubeadm, kubectl)
- Helm package manager
- AWS CLI v2
- System kernel parameters
- Security hardening

**Duration:** ~10-15 minutes
**Requires:** Ubuntu 20.04 or later, root access

### setup-firewall.yml
Configures:
- UFW firewall
- SSH access rules with rate limiting
- HTTP/HTTPS rules
- Kubernetes internal communication
- Database access restrictions
- Fail2Ban for brute-force protection
- Auditd for security logging
- Sysctl hardening

**Duration:** ~5 minutes
**Requires:** Root access
**Important:** Update allowed_ssh_ips with your IP addresses!

### deploy-app.yml
Deploys:
- Kubernetes namespaces
- ConfigMaps and Secrets
- PostgreSQL database
- Backend API
- Frontend web app
- Ingress controller rules

**Duration:** ~5-10 minutes
**Requires:** Kubernetes cluster already running, kubectl configured

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/civicbirth.pem ubuntu@your-server-ip

# Check SSH keys
ssh-keygen -l -f ~/.ssh/civicbirth.pub
```

### Ansible Debugging
```bash
# Increase verbosity
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml -vvv

# Check inventory
ansible-inventory -i inventory/hosts.ini --list

# Run single task
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml --tags "docker-install"
```

### Firewall Locked Out
If you lock yourself out with UFW:
```bash
# Boot server into recovery mode and run
sudo ufw disable
```

## Security Best Practices

1. **Store secrets in Ansible vault:**
```bash
ansible-vault create group_vars/production/secrets.yml
```

2. **Limit SSH access:**
   - Always use SSH keys, never passwords
   - Update `allowed_ssh_ips` in firewall playbook

3. **Review playbooks:**
   - Always run `--check` first
   - Review changes before executing

4. **Monitor execution:**
   - Check logs in `./logs/ansible.log`
   - Monitor server during execution
   - Keep backup of working configurations

## Advanced Usage

### Run playbooks with tags
```bash
ansible-playbook playbooks/setup-kubernetes.yml --tags "docker"
```

### Run playbooks for specific hosts
```bash
ansible-playbook -i inventory/hosts.ini playbooks/setup-kubernetes.yml --limit production
```

### Check syntax of all playbooks
```bash
for playbook in playbooks/*.yml; do
  ansible-playbook $playbook --syntax-check
done
```

## Manual Steps (if needed)

### Initialize Kubernetes Master Node
```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### Join Worker Nodes
```bash
# On master, get join command
kubeadm token create --print-join-command

# On each worker node
sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

### Install Network Plugin
```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

## Documentation References

- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Helm Documentation](https://helm.sh/docs/)

---

**Last Updated:** 2026-06-05
**Maintained By:** CivicBirth Development Team
