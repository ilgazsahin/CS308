const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/UserModel");

const JWT_SECRET = 'your_jwt_secret_key'; // Consider storing this in an environment variable

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
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email, name: user.name }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});

// Register Endpoint
router.post("/register", async (req, res) => {
    const { email, name, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await UserModel.create({ email, name, password: hashedPassword });
        res.status(201).json({
            message: "User successfully created",
            user: { id: newUser._id, email: newUser.email, name: newUser.name }
        });
    } catch (err) {
        res.status(500).json({ message: "Error occurred during registration", error: err });
    }
});

module.exports = router;
