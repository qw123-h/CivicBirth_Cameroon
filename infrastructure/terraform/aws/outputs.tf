# Outputs
output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.civicbirth.endpoint
}

output "eks_cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.civicbirth.arn
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.civicbirth.name
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.civicbirth.endpoint
}

output "rds_address" {
  description = "RDS database host address"
  value       = aws_db_instance.civicbirth.address
}

output "rds_port" {
  description = "RDS database port"
  value       = aws_db_instance.civicbirth.port
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.civicbirth.dns_name
}

output "alb_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.civicbirth.arn
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.civicbirth.id
}

output "db_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "kubeconfig_command" {
  description = "Command to update kubeconfig"
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.civicbirth.name} --region ${var.aws_region}"
}

output "connection_string" {
  description = "PostgreSQL connection string for applications"
  value       = "postgresql://${var.db_username}:PASSWORD@${aws_db_instance.civicbirth.address}:${aws_db_instance.civicbirth.port}/${var.db_name}"
  sensitive   = true
}
