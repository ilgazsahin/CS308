// __tests__/CartContext.test.js
import React from 'react';
import { render, act, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { CartProvider, useCart } from '../client/src/components/CartContext';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the cart context
const TestComponent = () => {
  const { cartItems, cartCount, addToCart, removeFromCart } = useCart();
  
  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <ul>
        {cartItems.map(item => (
          <li key={item._id} data-testid={`cart-item-${item._id}`}>
            {item.title} - {item.quantity}
            <button 
              onClick={() => removeFromCart(item._id)}
              data-testid={`remove-${item._id}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => addToCart({ _id: 'book1', title: 'Test Book', price: 19.99 })}
        data-testid="add-book"
      >
        Add Book
      </button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock axios responses
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: [] });
  });

  test('should initialize with empty cart', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  test('should add item to cart', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    // Initial state
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    
    // Add item
    await act(async () => {
      screen.getByTestId('add-book').click();
    });
    
    // Check if item was added
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-item-book1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-book1')).toHaveTextContent('Test Book - 1');
    });
    
    // Verify localStorage was updated for guest users
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should remove item from cart', async () => {
    // Mock localStorage with a book already in cart
    localStorageMock.setItem('cart', JSON.stringify([
      { _id: 'book1', title: 'Test Book', price: 19.99, quantity: 1 }
    ]));
    
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    // Initial state with one item
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-item-book1')).toBeInTheDocument();
    });
    
    // Remove item
    await act(async () => {
      screen.getByTestId('remove-book1').click();
    });
    
    // Check if item was removed
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.queryByTestId('cart-item-book1')).not.toBeInTheDocument();
    });
  });

  test('should load cart from server when logged in', async () => {
    // Mock logged in user
    localStorageMock.setItem('userId', 'user123');
    localStorageMock.setItem('token', 'fake-token');
    
    // Mock server response with items in cart
    axios.get.mockResolvedValue({
      data: [
        { _id: 'book2', title: 'Server Book', price: 29.99, quantity: 2 }
      ]
    });
    
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    // Check if items from server were loaded
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-item-book2')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-book2')).toHaveTextContent('Server Book - 2');
    });
    
    // Verify server API was called
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/carts/user123'));
  });

  test('should merge localStorage and server carts', async () => {
    // Set up scenario: User had items in localStorage, then logs in
    // and has different items on the server
    
    // Initial state: items in localStorage but no userId yet
    localStorageMock.setItem('cart', JSON.stringify([
      { _id: 'book1', title: 'Local Book', price: 19.99, quantity: 1 }
    ]));
    
    // First, render without being logged in
    let renderResult;
    await act(async () => {
      renderResult = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });
    
    // Verify localStorage cart loaded
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-item-book1')).toBeInTheDocument();
    });
    
    // Now, user logs in - simulate this by:
    // 1. Setting userId in localStorage
    // 2. Mocking a different cart on the server
    // 3. Re-rendering the component
    localStorageMock.setItem('userId', 'user123');
    localStorageMock.setItem('token', 'fake-token');
    
    // Mock server cart with a different book
    axios.get.mockResolvedValue({
      data: [
        { _id: 'book2', title: 'Server Book', price: 29.99, quantity: 1 }
      ]
    });
    
    // Simulate handleLogin being called after login
    const { rerender } = renderResult;
    await act(async () => {
      rerender(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });
    
    // Wait and verify both items are in the cart (merged)
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-item-book1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-book2')).toBeInTheDocument();
    });
    
    // Verify cart was saved to server with merged items
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/carts/user123'),
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'book1' }),
          expect.objectContaining({ _id: 'book2' })
        ])
      })
    );
  });

  test('should handle cart item quantity updates correctly', async () => {
    const TestCartComponent = () => {
      const { cartItems, addToCart, updateQuantity, getCartTotal } = useCart();
      
      return (
        <div>
          <div data-testid="cart-count">{cartItems.length}</div>
          <div data-testid="cart-total">Total: ${getCartTotal().toFixed(2)}</div>
          <button onClick={() => addToCart({
            _id: '1',
            title: 'Test Book',
            author: 'Test Author',
            price: 20.00,
            image: 'test.jpg'
          })}>
            Add Book
          </button>
          <button onClick={() => updateQuantity('1', 3)}>
            Update Quantity
          </button>
          {cartItems.map(item => (
            <div key={item._id} data-testid={`item-${item._id}`}>
              {item.title} - Qty: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
            </div>
          ))}
        </div>
      );
    };

    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // Initially empty cart
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    
    // Add item
    fireEvent.click(screen.getByText('Add Book'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $20.00');
    
    // Update quantity
    fireEvent.click(screen.getByText('Update Quantity'));
    expect(screen.getByTestId('item-1')).toHaveTextContent('Test Book - Qty: 3 - $60.00');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $60.00');
  });
}); 