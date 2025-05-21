import axios from 'axios';

// Check if user has specific role
export const hasRole = async (role) => {
  try {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      console.log('No user ID or token found');
      return false;
    }
    
    // Try to get from localStorage first (faster)
    const cachedUserType = localStorage.getItem('userType');
    console.log('Cached user type:', cachedUserType);
    
    if (cachedUserType) {
      const hasAccess = 
        cachedUserType === role || 
        cachedUserType.includes(role) || 
        cachedUserType === 'admin';
      
      console.log(`Quick check for role ${role}:`, hasAccess);
      return hasAccess;
    }
    
    // If not in cache, fetch from API
    console.log(`Fetching user role from API for userId: ${userId}`);
    const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
    console.log('User data received:', response.data);
    
    const userType = response.data.userType || '';
    console.log('User type from API:', userType);
    
    // Cache for future use
    localStorage.setItem('userType', userType);
    
    const hasAccess = 
      userType === role || 
      userType.includes(role) || 
      userType === 'admin';
    
    console.log(`Access for role ${role}:`, hasAccess);
    return hasAccess;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Get current user's role
export const getUserRole = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      return null;
    }
    
    // Try cache first
    const cachedUserType = localStorage.getItem('userType');
    if (cachedUserType) {
      return cachedUserType;
    }
    
    // Fetch from API
    const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
    const userType = response.data.userType || '';
    
    // Cache for future use
    localStorage.setItem('userType', userType);
    
    return userType;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}; 