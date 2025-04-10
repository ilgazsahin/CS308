import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the cart context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    
    // Recalculate count and total
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    
    const price = cartItems.reduce((total, item) => 
      total + (parseFloat(item.price) || 0) * item.quantity, 0);
    setCartTotal(price);
  }, [cartItems]);

  // Function to add an item to the cart
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Function to update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      return prevItems.map(item => 
        item._id === productId ? { ...item, quantity } : item
      );
    });
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  // Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };
  
  // Merge local cart with user cart after login
  const mergeWithUserCart = (userCart) => {
    if (!userCart || !userCart.length) return;
    
    // Combine local cart with user cart, preserving higher quantities
    const combinedCart = [...cartItems];
    
    userCart.forEach(userItem => {
      const localItemIndex = combinedCart.findIndex(item => item._id === userItem._id);
      
      if (localItemIndex >= 0) {
        // Item exists in both carts, keep higher quantity
        const localQuantity = combinedCart[localItemIndex].quantity;
        const userQuantity = userItem.quantity;
        
        combinedCart[localItemIndex].quantity = Math.max(localQuantity, userQuantity);
      } else {
        // Item only in user cart, add it
        combinedCart.push(userItem);
      }
    });
    
    setCartItems(combinedCart);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      mergeWithUserCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 