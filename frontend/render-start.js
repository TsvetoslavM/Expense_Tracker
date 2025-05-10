// render-start.js - Custom start script for Render deployment
const { execSync } = require('child_process');
const path = require('path');

console.log('=== Starting Render Frontend Script ===');
console.log('Environment Information:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT || '3000 (default)'}`);
console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'not set'}`);
console.log(`RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL || 'not set'}`);

// Use Render's assigned port or fall back to 3000
const port = process.env.PORT || 3000;

try {
  console.log(`Starting Next.js on port ${port}...`);
  execSync(`next start -p ${port}`, { 
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  console.error('Error starting Next.js application:', error);
  process.exit(1);
} 