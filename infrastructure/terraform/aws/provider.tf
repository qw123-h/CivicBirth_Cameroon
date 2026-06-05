# AWS Provider Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend (recommended for team projects)
  # backend "s3" {
  #   bucket         = "civicbirth-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "CivicBirth"
      ManagedBy   = "Terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}
