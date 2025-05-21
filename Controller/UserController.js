const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/UserModel");

const JWT_SECRET = 'your_jwt_secret_key'; // Consider storing this in an environment variable

// Middleware to verify token and extract user
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided" });
    }
    
    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Invalid token" });
    }
};

// Get all users (admin endpoint)
router.get("/", async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 }); // Exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving users", error: err.message });
    }
});

// Login Endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const token = jwt.sign({ id: user._id, email: user.email, userType: user.userType }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: "Login successful",
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name, 
                address: user.address,
                userType: user.userType 
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Register Endpoint
router.post("/register", async (req, res) => {
    const { email, name, password, address, userType } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user with userType and address
        const userData = { 
            email, 
            name, 
            password: hashedPassword
        };
        
        if (address) {
            userData.address = address;
        }
        
        if (userType && ['customer', 'product', 'sales'].includes(userType)) {
            userData.userType = userType;
        }
        
        const newUser = await UserModel.create(userData);
        res.status(201).json({
            message: "User successfully created",
            user: { 
                id: newUser._id, 
                email: newUser.email, 
                name: newUser.name, 
                address: newUser.address,
                userType: newUser.userType 
            }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Error occurred during registration", error: err.message });
    }
});

// Get a single user by ID
router.get("/:id", async (req, res) => {
    try {
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        const user = await UserModel.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(user);
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ message: "Error retrieving user", error: err.message });
    }
});

// Update user type
router.patch("/:id/type", async (req, res) => {
    try {
        const { userType } = req.body;
        
        if (!userType || !['customer', 'product', 'sales'].includes(userType)) {
            return res.status(400).json({ message: "Invalid user type" });
        }
        
        const user = await UserModel.findByIdAndUpdate(
            req.params.id, 
            { userType }, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ message: "User type updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Error updating user type", error: err.message });
    }
});

// Update user address
router.patch("/:id/address", async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ message: "Address is required" });
        }
        
        const user = await UserModel.findByIdAndUpdate(
            req.params.id, 
            { address }, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ message: "Address updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Error updating address", error: err.message });
    }
});

// Update user profile
router.put("/:id", async (req, res) => {
    try {
        const { name, email, address } = req.body;
        const updateData = {};
        
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        
        // Don't allow updating userType through this endpoint for security
        
        const user = await UserModel.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
});

module.exports = router;
