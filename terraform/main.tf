terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

# Create a Docker network
resource "docker_network" "expense_tracker_network" {
  name = "expense_tracker_network"
}

# Create a volume for the database
resource "docker_volume" "sqlite_data" {
  name = "expense_tracker_sqlite_data"
  driver = "local"
  driver_opts = {}
}

# Create the backend container
resource "docker_container" "backend" {
  name  = "expense_tracker_backend"
  image = "expense_tracker_backend:latest"
  
  networks_advanced {
    name = docker_network.expense_tracker_network.name
  }

  volumes {
    volume_name    = docker_volume.sqlite_data.name
    container_path = "/app/data"
    read_only      = false
  }

  ports {
    internal = 8000
    external = 8000
  }

  env = [
    "USE_SQLITE=True",
    "DATABASE_URL=sqlite:///./data/expense_tracker.db",
    "PYTHONPATH=/app"
  ]

  command = ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

  # Add health check
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "40s"
  }

  # Add restart policy
  restart = "unless-stopped"
}

# Create the frontend container
resource "docker_container" "frontend" {
  name  = "expense_tracker_frontend"
  image = "expense_tracker_frontend:latest"
  
  networks_advanced {
    name = docker_network.expense_tracker_network.name
  }

  # Mount the frontend code
  volumes {
    host_path      = "${path.cwd}/../frontend"
    container_path = "/app"
    read_only      = false
  }

  ports {
    internal = 3000
    external = 3000
  }

  env = [
    "NEXT_PUBLIC_API_URL=http://localhost:8000",
    "PORT=3000"
  ]

  # Use development mode for better debugging
  command = ["sh", "-c", "npm install --legacy-peer-deps && npm run dev"]

  # Add health check
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:3000"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "40s"
  }

  # Add restart policy
  restart = "unless-stopped"

  depends_on = [docker_container.backend]
} 