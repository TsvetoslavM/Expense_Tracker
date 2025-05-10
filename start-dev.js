const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  backend: {
    cwd: path.join(__dirname, 'backend'),
    command: process.platform === 'win32' ? 'python' : 'python3',
    args: ['run.py'],
    name: 'BACKEND'
  },
  frontend: {
    cwd: path.join(__dirname, 'frontend'),
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    name: 'FRONTEND'
  }
};

// Function to start a service
function startService(service) {
  console.log(`Starting ${service.name}...`);
  
  // Make sure the directory exists
  if (!fs.existsSync(service.cwd)) {
    console.error(`Error: Directory ${service.cwd} does not exist!`);
    return null;
  }
  
  // Spawn the process
  const process = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'pipe',
    shell: true
  });
  
  // Handle process events
  process.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${service.name} ERROR] ${data.toString().trim()}`);
  });
  
  process.on('close', (code) => {
    console.log(`[${service.name}] Process exited with code ${code}`);
  });
  
  return process;
}

// Start both services
console.log('Starting development environment...');
const backendProcess = startService(config.backend);
const frontendProcess = startService(config.frontend);

// Handle script termination
process.on('SIGINT', () => {
  console.log('Shutting down development environment...');
  
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (frontendProcess) {
    frontendProcess.kill();
  }
  
  process.exit(0);
}); 