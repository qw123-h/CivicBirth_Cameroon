# RDS Security Group (already defined in vpc.tf)

# RDS Parameter Group
resource "aws_db_parameter_group" "postgres" {
  name   = "civicbirth-postgres-params"
  family = "postgres15"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "0"
  }

  tags = {
    Name = "civicbirth-postgres-params"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "civicbirth" {
  name       = "civicbirth-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "civicbirth-db-subnet-group"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "civicbirth" {
  identifier     = var.db_identifier
  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_max_allocated_storage
  storage_encrypted      = true
  storage_type           = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.civicbirth.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  multi_az               = var.db_multi_az
  backup_retention_period = var.db_backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "civicbirth-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  copy_tags_to_snapshot = true
  deletion_protection   = var.environment == "production"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "civicbirth-postgres"
  }

  depends_on = [aws_db_subnet_group.civicbirth]
}

# Store database credentials in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "civicbirth/db-credentials"
  description             = "CivicBirth database credentials"
  recovery_window_in_days = 7

  tags = {
    Name = "civicbirth-db-secret"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = "postgres"
    host     = aws_db_instance.civicbirth.address
    port     = aws_db_instance.civicbirth.port
    dbname   = var.db_name
  })
}

# CloudWatch Alarms for RDS
resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  alarm_name          = "civicbirth-db-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alert when database CPU exceeds 80%"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.civicbirth.id
  }
}

resource "aws_cloudwatch_metric_alarm" "db_storage" {
  alarm_name          = "civicbirth-db-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "10737418240" # 10 GB in bytes
  alarm_description   = "Alert when database storage is below 10GB"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.civicbirth.id
  }
}
