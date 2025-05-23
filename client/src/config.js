// This file centralizes all configuration for the application
// For Docker deployment, the API URL is set to point to the backend container
// When running locally, it will use the proxy in package.json

// Use environment variable if defined, otherwise default to relative URL
const API_URL = process.env.REACT_APP_API_URL || '';

// Export configuration variables
export default {
  API_URL,
  // Add more configuration values here as needed
}; 