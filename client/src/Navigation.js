import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/HomePage/HomePage';
import Signup from './pages/Signup';
import AddBook from "./pages/AddBook";
import BookDetail from "./pages/BookDetail";
import Dashboard from "./pages/AdminDashboard";
import EditBook from "./pages/EditBook";  // Make sure you import your EditBook component
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistory from "./pages/OrderHistory";
import InvoicePage from "./pages/InvoicePage";
import ProfilePage from "./pages/ProfilePage"; // Import the new ProfilePage
import StockManagement from "./pages/StockManagement"; // Import the new StockManagement page
import WishListPage from "./pages/WishListPage"; // Import the WishListPage with correct casing
import ProductManagerDashboard from "./pages/ProductManagerDashboard"; // Import the ProductManagerDashboard
import SalesManagerDashboard from "./pages/SalesManagerDashboard"; // Import the SalesManagerDashboard
import { CartProvider } from './components/CartContext';
import { WishlistProvider } from './components/WishlistContext';
import ManageOrders from './pages/ManageOrders';

const Navigation = () => {
    return (
        <Router>
            <CartProvider>
                <WishlistProvider>
                    <Routes>
                        {/* Start the app at HomePage */}
                        <Route path="/" element={<MainPage />} />
                        <Route path="/home" element={<MainPage />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<Signup />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Book-related Routes */}
                        <Route path="/addbook" element={<AddBook />} />
                        <Route path="/book/:id" element={<BookDetail />} />
                        <Route path="/editbook/:id" element={<EditBook />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/about" element={<AboutPage />} />

                        {/* Cart and Checkout Routes */}
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlist" element={<WishListPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/orders" element={<OrderHistory />} />
                        <Route path="/invoice/:orderId" element={<InvoicePage />} />

                        {/* Manager Dashboards */}
                        <Route path="/product-manager" element={<ProductManagerDashboard />} />
                        <Route path="/sales-manager" element={<SalesManagerDashboard />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<Dashboard />} />
                        <Route path="/admin/stock" element={<StockManagement />} />
                        <Route path="/admin/manage-orders" element={<ManageOrders />} />
                    </Routes>
                </WishlistProvider>
            </CartProvider>
        </Router>
    );
};

export default Navigation;
