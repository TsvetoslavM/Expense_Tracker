output "backend_container_id" {
  description = "ID of the backend container"
  value       = docker_container.backend.id
}

output "frontend_container_id" {
  description = "ID of the frontend container"
  value       = docker_container.frontend.id
}

output "network_id" {
  description = "ID of the Docker network"
  value       = docker_network.expense_tracker_network.id
}

output "volume_id" {
  description = "ID of the SQLite data volume"
  value       = docker_volume.sqlite_data.id
} 