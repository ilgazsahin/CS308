import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/HomePage';
import Signup from './pages/Signup';  
import AddBook from "./pages/AddBook";
import BookDetail from "./pages/BookDetail";
import Dashboard from "./pages/AdminDashboard";

const Navigation = () => {
    return (
        <Router>
            <Routes>
                {/* Start the app at HomePage */}
                <Route path="/" element={<MainPage />} />
                
                {/* Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Another route for Home if you want /home as well */}
                <Route path="/home" element={<MainPage />} />

                {/* Register page */}
                <Route path="/register" element={<Signup />} />

                {/* Add Book page */}
                <Route path="/addbook" element={<AddBook />} />

                {/* Single Book Detail page */}
                <Route path="/book/:id" element={<BookDetail />} />

                {/* Admin Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} /> 
            </Routes>
        </Router>
    );
};

export default Navigation;
