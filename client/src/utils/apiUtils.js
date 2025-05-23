import config from '../config';

/**
 * Creates a full API URL based on the endpoint
 * @param {string} endpoint - API endpoint without leading slash (e.g., 'api/users')
 * @returns {string} - Full URL
 */
export const apiUrl = (endpoint) => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Ensure endpoint doesn't start with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // If using a proxy or relative URLs
  if (!config.API_URL) {
    return `/${cleanEndpoint}`;
  }
  
  // Otherwise use the full API URL
  return `${config.API_URL}/${cleanEndpoint}`;
};

/**
 * Example usage:
 * import { apiUrl } from '../utils/apiUtils';
 * 
 * // Instead of:
 * // axios.get('http://localhost:3001/api/users/123')
 * 
 * // Use:
 * axios.get(apiUrl('api/users/123'))
 */ 