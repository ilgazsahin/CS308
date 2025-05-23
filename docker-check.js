/**
 * Docker Configuration Checker Script
 * 
 * Run this script to check if your project has proper Docker configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to check
const requiredFiles = [
  { path: 'Dockerfile', description: 'Backend Dockerfile' },
  { path: 'client/Dockerfile', description: 'Frontend Dockerfile' },
  { path: 'docker-compose.yml', description: 'Docker Compose configuration' },
  { path: '.dockerignore', description: 'Backend .dockerignore file' },
  { path: 'client/.dockerignore', description: 'Frontend .dockerignore file' }
];

// Check Docker installation
function checkDockerInstallation() {
  console.log('Checking Docker installation...');
  
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' });
    console.log(`✅ Docker is installed: ${dockerVersion.trim()}`);
    
    const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' });
    console.log(`✅ Docker Compose is installed: ${composeVersion.trim()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Docker or Docker Compose is not installed');
    console.log('Please install Docker and Docker Compose: https://docs.docker.com/get-docker/');
    return false;
  }
}

// Check required files
function checkRequiredFiles() {
  console.log('\nChecking required Docker configuration files...');
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file.path);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file.description} exists: ${file.path}`);
    } else {
      console.error(`❌ ${file.description} is missing: ${file.path}`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// Main function
function main() {
  console.log('=== Docker Configuration Checker ===\n');
  
  const dockerInstalled = checkDockerInstallation();
  const filesExist = checkRequiredFiles();
  
  console.log('\n=== Summary ===');
  if (dockerInstalled && filesExist) {
    console.log('✅ Your project is ready for Docker deployment');
    console.log('\nTo build and start your application with Docker, run:');
    console.log('  docker-compose up -d');
  } else {
    console.log('❌ Your project is not fully configured for Docker');
    console.log('Please fix the issues above before deploying with Docker');
  }
}

main(); 