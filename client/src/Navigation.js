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

const Navigation = () => {
    return (
        <Router>
            <Routes>
                {/* Start the app at HomePage */}
                <Route path="/" element={<MainPage />} />
                <Route path="/home" element={<MainPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Signup />} />

                {/* Book-related Routes */}
                <Route path="/addbook" element={<AddBook />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/editbook/:id" element={<EditBook />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Admin Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
};

export default Navigation;
