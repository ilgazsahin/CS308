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
import { CartProvider } from './components/CartContext';
import ManageOrders from './pages/ManageOrders';

const Navigation = () => {
    return (
        <Router>
            <CartProvider>
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
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/invoice/:orderId" element={<InvoicePage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/stock" element={<StockManagement />} />
                    <Route path="/admin/manage-orders" element={<ManageOrders />} />
                </Routes>
            </CartProvider>
        </Router>
    );
};

export default Navigation;
