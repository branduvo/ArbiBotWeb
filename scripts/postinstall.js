const { execSync } = require('child_process');

// Install additional dependencies
try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}




