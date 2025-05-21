import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

// Create the wishlist context
const WishlistContext = createContext();

// Custom hook to use the wishlist context
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in
  const userId = localStorage.getItem('userId');
  const isLoggedIn = !!userId;

  // Load wishlist on initial load and when login state changes
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      
      if (isLoggedIn) {
        try {
          // First, get any items from localStorage
          const localWishlist = getLocalWishlist();
          
          // Then try to fetch wishlist from MongoDB
          const response = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
          const serverWishlist = response.data.map(item => item.bookId);
          
          // If localStorage has items and user is newly logged in, merge wishlists and update server
          if (localWishlist.length > 0) {
            const mergedItems = mergeWishlistItems(localWishlist, serverWishlist);
            setWishlistItems(mergedItems);
            
            // Save merged wishlist to server
            for (const item of mergedItems) {
              if (!serverWishlist.some(serverItem => serverItem._id === item._id)) {
                await axios.post(`http://localhost:3001/api/wishlist`, {
                  userId,
                  bookId: item._id
                });
              }
            }
            
            // Clear localStorage wishlist now that it's saved to server
            localStorage.removeItem('wishlist');
          } else {
            // Just use server wishlist
            setWishlistItems(serverWishlist);
          }
        } catch (error) {
          console.error('Error fetching wishlist from server:', error);
          // Fallback to localStorage if server fails
          const localWishlist = getLocalWishlist();
          setWishlistItems(localWishlist);
        }
      } else {
        // Not logged in, use localStorage
        const localWishlist = getLocalWishlist();
        setWishlistItems(localWishlist);
      }
      
      setIsLoading(false);
    };
    
    loadWishlist();
  }, [isLoggedIn, userId]);

  // Helper to get wishlist from localStorage
  const getLocalWishlist = () => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      localStorage.removeItem('wishlist');
      return [];
    }
  };

  // Helper to merge wishlist items, keeping unique items
  const mergeWishlistItems = (localItems, serverItems) => {
    // Create a map for faster lookups based on product ID
    const mergedItemsMap = new Map();
    
    // First, add all items from localStorage to the map
    localItems.forEach(item => {
      mergedItemsMap.set(item._id, { ...item });
    });
    
    // Then, process server items
    serverItems.forEach(serverItem => {
      if (!mergedItemsMap.has(serverItem._id)) {
        // Item only in server wishlist, add it
        mergedItemsMap.set(serverItem._id, { ...serverItem });
      }
    });
    
    // Convert map back to array
    return Array.from(mergedItemsMap.values());
  };

  // Update wishlist whenever items change
  useEffect(() => {
    // Update count
    setWishlistCount(wishlistItems.length);
    
    // Save wishlist
    if (wishlistItems.length > 0) {
      if (isLoggedIn) {
        // Don't need to do anything here as we'll handle adding/removing individually
        // through API calls in addToWishlist and removeFromWishlist
      } else {
        // Save to localStorage if not logged in
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      }
    } else {
      // Wishlist is empty, clear storage
      localStorage.removeItem('wishlist');
    }
  }, [wishlistItems, isLoggedIn, userId]);

  // Function to check if an item is in the wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  // Function to add an item to the wishlist
  const addToWishlist = async (product) => {
    // Check if the item is already in the wishlist
    if (isInWishlist(product._id)) {
      return false; // Already in wishlist
    }
    
    try {
      if (isLoggedIn) {
        // If logged in, save to server first
        await axios.post('http://localhost:3001/api/wishlist', {
          userId,
          bookId: product._id
        });
      }
      
      // Then update local state
      setWishlistItems(prevItems => [...prevItems, product]);
      return true; // Successfully added
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      
      // If server fails but user is not logged in, still update local state
      if (!isLoggedIn) {
        setWishlistItems(prevItems => [...prevItems, product]);
        return true;
      }
      return false;
    }
  };

  // Function to remove an item from the wishlist
  const removeFromWishlist = async (productId) => {
    try {
      if (isLoggedIn) {
        // If logged in, find the wishlist entry ID
        const response = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
        const wishlistEntry = response.data.find(item => item.bookId._id === productId);
        
        if (wishlistEntry) {
          // Delete from server
          await axios.delete(`http://localhost:3001/api/wishlist/${wishlistEntry._id}`);
        }
      }
      
      // Then update local state
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== productId));
      return true; // Successfully removed
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      
      // If server fails but user is not logged in, still update local state
      if (!isLoggedIn) {
        setWishlistItems(prevItems => prevItems.filter(item => item._id !== productId));
        return true;
      }
      return false;
    }
  };

  // Function to clear the wishlist
  const clearWishlist = async () => {
    try {
      if (isLoggedIn) {
        // Get all wishlist items for this user
        const response = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
        
        // Delete each item
        for (const item of response.data) {
          await axios.delete(`http://localhost:3001/api/wishlist/${item._id}`);
        }
      }
      
      // Clear local state
      setWishlistItems([]);
      localStorage.removeItem('wishlist');
      return true; // Successfully cleared
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };
  
  // Handle user login - to be called after login is successful
  const handleLogin = async (newUserId) => {
    if (!newUserId) return;
    
    try {
      // Get any items from localStorage first
      const localWishlist = getLocalWishlist();
      
      // Then try to fetch user's wishlist from server
      const response = await axios.get(`http://localhost:3001/api/wishlist/${newUserId}`);
      const serverWishlist = response.data.map(item => item.bookId);
      
      // Merge wishlists, keeping all items
      const mergedItems = mergeWishlistItems(localWishlist, serverWishlist);
      
      // Update state
      setWishlistItems(mergedItems);
      
      // Save any new items to server
      for (const item of localWishlist) {
        if (!serverWishlist.some(serverItem => serverItem._id === item._id)) {
          await axios.post(`http://localhost:3001/api/wishlist`, {
            userId: newUserId,
            bookId: item._id
          });
        }
      }
      
      // Clear localStorage wishlist now that it's saved to server
      localStorage.removeItem('wishlist');
    } catch (error) {
      console.error('Error handling login for wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      isLoading,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      handleLogin
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext; 