variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "expense-tracker"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "development"
}

variable "backend_port" {
  description = "Port for the backend service"
  type        = number
  default     = 8000
}

variable "frontend_port" {
  description = "Port for the frontend service"
  type        = number
  default     = 3000
}

variable "backend_image" {
  description = "Backend Docker image name"
  type        = string
  default     = "expense_tracker_backend:latest"
}

variable "frontend_image" {
  description = "Frontend Docker image name"
  type        = string
  default     = "expense_tracker_frontend:latest"
} 