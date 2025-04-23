import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the cart context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in
  const userId = localStorage.getItem('userId');
  const isLoggedIn = !!userId;

  // Load cart on initial load and when login state changes
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      
      if (isLoggedIn) {
        try {
          // First, get any items from localStorage
          const localCart = getLocalCart();
          
          // Then try to fetch cart from MongoDB
          const response = await axios.get(`http://localhost:3001/api/carts/${userId}`);
          const serverCart = response.data;
          
          // If localStorage has items and user is newly logged in, merge carts and update server
          if (localCart.length > 0) {
            const mergedItems = mergeCartItems(localCart, serverCart);
            setCartItems(mergedItems);
            
            // Save merged cart to server
            await axios.post(`http://localhost:3001/api/carts/${userId}`, {
              items: mergedItems
            });
            
            // Clear localStorage cart now that it's saved to server
            localStorage.removeItem('cart');
          } else {
            // Just use server cart
            setCartItems(serverCart);
          }
        } catch (error) {
          console.error('Error fetching cart from server:', error);
          // Fallback to localStorage if server fails
          const localCart = getLocalCart();
          setCartItems(localCart);
        }
      } else {
        // Not logged in, use localStorage
        const localCart = getLocalCart();
        setCartItems(localCart);
      }
      
      setIsLoading(false);
    };
    
    loadCart();
  }, [isLoggedIn, userId]);

  // Helper to get cart from localStorage
  const getLocalCart = () => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      localStorage.removeItem('cart');
      return [];
    }
  };

  // Helper to merge cart items, preferring higher quantities
  const mergeCartItems = (localItems, serverItems) => {
    const mergedCart = [...localItems];
    
    serverItems.forEach(serverItem => {
      const localItemIndex = mergedCart.findIndex(item => item._id === serverItem._id);
      
      if (localItemIndex >= 0) {
        // Item exists in both carts, keep higher quantity
        const localQuantity = mergedCart[localItemIndex].quantity;
        const serverQuantity = serverItem.quantity;
        
        mergedCart[localItemIndex].quantity = Math.max(localQuantity, serverQuantity);
      } else {
        // Item only in server cart, add it
        mergedCart.push(serverItem);
      }
    });
    
    return mergedCart;
  };

  // Update cart whenever items change
  useEffect(() => {
    // Recalculate count and total
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    
    const price = cartItems.reduce((total, item) => 
      total + (parseFloat(item.price) || 0) * item.quantity, 0);
    setCartTotal(price);
    
    // Save cart
    if (cartItems.length > 0) {
      if (isLoggedIn) {
        // Save to MongoDB if logged in
        const saveToServer = async () => {
          try {
            await axios.post(`http://localhost:3001/api/carts/${userId}`, {
              items: cartItems
            });
          } catch (error) {
            console.error('Error saving cart to server:', error);
            
            // Fallback to localStorage if server fails
            localStorage.setItem('cart', JSON.stringify(cartItems));
          }
        };
        
        saveToServer();
      } else {
        // Save to localStorage if not logged in
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
    } else {
      // Cart is empty, clear storage
      if (isLoggedIn) {
        axios.delete(`http://localhost:3001/api/carts/${userId}`)
          .catch(err => console.error('Error deleting cart from server:', err));
      }
      localStorage.removeItem('cart');
    }
  }, [cartItems, isLoggedIn, userId]);

  // Function to add an item to the cart
  const addToCart = async (product) => {
    // First check if the product has stock information
    if (product.stock !== undefined && product.stock <= 0) {
      // Item is out of stock, show error and don't add
      alert(`Sorry, "${product.title}" is out of stock.`);
      return false;
    }
    
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Item exists, check if requested quantity exceeds stock
        const currentQuantity = prevItems[existingItemIndex].quantity;
        const newQuantity = currentQuantity + 1;
        
        // If we have stock info, ensure we don't exceed it
        if (product.stock !== undefined && newQuantity > product.stock) {
          alert(`Sorry, only ${product.stock} units of "${product.title}" are available. You already have ${currentQuantity} in your cart.`);
          return prevItems; // Don't update
        }
        
        // Stock is available or not tracked, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    
    return true; // Successfully added
  };

  // Function to update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }
    
    // Check if the new quantity exceeds stock
    const existingItem = cartItems.find(item => item._id === productId);
    if (existingItem) {
      // If the product has stock info, check if quantity exceeds it
      if (existingItem.stock !== undefined && quantity > existingItem.stock) {
        alert(`Sorry, only ${existingItem.stock} units of "${existingItem.title}" are available.`);
        return false;
      }
      
      // Stock is available or not tracked, update quantity
      setCartItems(prevItems => {
        return prevItems.map(item => 
          item._id === productId ? { ...item, quantity } : item
        );
      });
      return true;
    }
    
    return false;
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  // Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    
    if (isLoggedIn) {
      axios.delete(`http://localhost:3001/api/carts/${userId}`)
        .catch(err => console.error('Error clearing cart from server:', err));
    }
  };
  
  // Handle user login - to be called after login is successful
  const handleLogin = async (newUserId) => {
    if (!newUserId) return;
    
    try {
      // Get any items from localStorage first
      const localCart = getLocalCart();
      
      // Then try to fetch user's cart from server
      const response = await axios.get(`http://localhost:3001/api/carts/${newUserId}`);
      const serverCart = response.data || [];
      
      // Merge carts, preferring higher quantities
      const mergedItems = mergeCartItems(localCart, serverCart);
      
      // Update state
      setCartItems(mergedItems);
      
      // Save merged cart to server
      await axios.post(`http://localhost:3001/api/carts/${newUserId}`, {
        items: mergedItems
      });
      
      // Clear localStorage cart now that it's saved to server
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error handling login for cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      handleLogin
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 