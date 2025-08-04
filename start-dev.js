const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Say-Pharmacy Development Environment...\n');

// Start backend server
console.log('📦 Starting Backend Server...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// Give backend time to start
setTimeout(() => {
  console.log('\n💻 Starting Frontend Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit'
  });

  frontend.on('error', (err) => {
    console.error('Failed to start frontend:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...');
  backend.kill();
  process.exit();
});
