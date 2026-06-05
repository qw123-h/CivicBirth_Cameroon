# AWS Region
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Environment
variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "production"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# EKS Configuration
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "civicbirth-eks"
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.28"
}

variable "instance_type" {
  description = "EC2 instance type for EKS nodes"
  type        = string
  default     = "t3.large"
}

variable "desired_node_count" {
  description = "Desired number of nodes in the node group"
  type        = number
  default     = 2
}

variable "min_node_count" {
  description = "Minimum number of nodes in the node group"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of nodes in the node group"
  type        = number
  default     = 5
}

# RDS Configuration
variable "db_identifier" {
  description = "Identifier for RDS instance"
  type        = string
  default     = "civicbirth-postgres"
}

variable "db_name" {
  description = "Name of the initial database"
  type        = string
  default     = "civicbirth"
}

variable "db_username" {
  description = "Master username for database"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Master password for database"
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.3"
}

variable "db_instance_class" {
  description = "Instance class for RDS"
  type        = string
  default     = "db.t3.small"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 50
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage in GB (for autoscaling)"
  type        = number
  default     = 500
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = true
}

variable "db_backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

# Monitoring
variable "alarm_actions" {
  description = "SNS topic ARNs for CloudWatch alarms"
  type        = list(string)
  default     = []
}

# Tags
variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
