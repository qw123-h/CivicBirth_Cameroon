# Application Load Balancer
resource "aws_lb" "civicbirth" {
  name               = "civicbirth-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production"
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "civicbirth-alb"
  }
}

# Target Group for Backend
resource "aws_lb_target_group" "backend" {
  name        = "civicbirth-backend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.civicbirth.id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200-299"
  }

  tags = {
    Name = "civicbirth-backend-tg"
  }
}

# Target Group for Frontend
resource "aws_lb_target_group" "frontend" {
  name        = "civicbirth-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.civicbirth.id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200-299"
  }

  tags = {
    Name = "civicbirth-frontend-tg"
  }
}

# HTTP Listener (redirects to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.civicbirth.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener (requires SSL certificate)
# Note: You need to create/import an ACM certificate first
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.civicbirth.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
#   certificate_arn   = var.ssl_certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.frontend.arn
#   }
# }

# HTTP Listener rules (for now, redirect all to HTTPS)
resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "frontend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

# CloudWatch Alarm for ALB
resource "aws_cloudwatch_metric_alarm" "alb_unhealthy_hosts" {
  alarm_name          = "civicbirth-alb-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "Alert when ALB has unhealthy targets"
  alarm_actions       = var.alarm_actions

  dimensions = {
    LoadBalancer = aws_lb.civicbirth.arn_suffix
  }
}
