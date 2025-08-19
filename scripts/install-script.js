const { execSync } = require('child_process');

// Install additional dependencies
try {
  execSync('npm install sqlite3@^5.1.6', { stdio: 'inherit' });
  execSync('npm install request@^2.88.2', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}




