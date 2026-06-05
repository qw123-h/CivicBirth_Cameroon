# VPC Configuration
resource "aws_vpc" "civicbirth" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "civicbirth-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "civicbirth" {
  vpc_id = aws_vpc.civicbirth.id

  tags = {
    Name = "civicbirth-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.civicbirth.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "civicbirth-public-subnet-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.civicbirth.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "civicbirth-private-subnet-${count.index + 1}"
  }
}

# Elastic IPs for NAT Gateway
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "civicbirth-eip-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.civicbirth]
}

# NAT Gateways
resource "aws_nat_gateway" "civicbirth" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "civicbirth-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.civicbirth]
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.civicbirth.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.civicbirth.id
  }

  tags = {
    Name = "civicbirth-public-rt"
  }
}

# Route Table Associations (Public)
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route Tables for Private Subnets
resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.civicbirth.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.civicbirth[count.index].id
  }

  tags = {
    Name = "civicbirth-private-rt-${count.index + 1}"
  }
}

# Route Table Associations (Private)
resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Group for Load Balancer
resource "aws_security_group" "alb" {
  name        = "civicbirth-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.civicbirth.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "civicbirth-alb-sg"
  }
}

# Security Group for EKS Nodes
resource "aws_security_group" "eks_nodes" {
  name        = "civicbirth-eks-nodes-sg"
  description = "Security group for EKS nodes"
  vpc_id      = aws_vpc.civicbirth.id

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "civicbirth-eks-nodes-sg"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "civicbirth-rds-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.civicbirth.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "civicbirth-rds-sg"
  }
}
