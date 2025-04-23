const express = require("express");
const router = express.Router();
const OrderModel = require("../Models/OrderModel");
const axios = require("axios");

// Create a new order
router.post("/", async (req, res) => {
    try {
        const orderData = req.body;
        
        // First, check and update stock levels
        try {
            // Make a request to decrease stock for all ordered items
            const stockResponse = await axios.post('http://localhost:3001/api/books/decrease-stock', {
                items: orderData.items
            });
            
            // If we get here, stock update was successful
            
            // Now create the order
            const newOrder = await OrderModel.create(orderData);
            
            // Return both the order and stock update information
            res.status(201).json({
                order: newOrder,
                stockUpdates: stockResponse.data.updates
            });
        } catch (stockError) {
            // If the stock update failed, return error
            if (stockError.response && stockError.response.data) {
                return res.status(stockError.response.status || 400).json({
                    message: "Could not create order due to stock issues",
                    stockErrors: stockError.response.data
                });
            }
            throw stockError; // Re-throw if it's not a response error
        }
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(400).json({ message: "Error creating order", error: err.message });
    }
});

// Get all orders for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const orders = await OrderModel.find({ userId: req.params.userId })
            .sort({ orderDate: -1 }); // Sort by date, newest first
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving orders", error: err.message });
    }
});

// Check if a user has purchased a specific book
router.get("/check-purchase", async (req, res) => {
    try {
        const { userId, bookId } = req.query;
        
        if (!userId || !bookId) {
            return res.status(400).json({ 
                message: "Missing required parameters", 
                hasPurchased: false 
            });
        }

        // Find orders for this user that contain the specified book
        const orders = await OrderModel.find({
            userId,
            'items._id': bookId,
            status: 'Paid' // Only count completed orders
        });

        // User has purchased if at least one matching order exists
        const hasPurchased = orders.length > 0;
        
        res.json({ hasPurchased });
    } catch (err) {
        console.error("Error checking purchase status:", err);
        res.status(500).json({ 
            message: "Error checking purchase status", 
            error: err.message,
            hasPurchased: false
        });
    }
});

// Get a specific order by orderId
router.get("/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        
        const order = await OrderModel.findOne({ orderId: parseInt(orderId) });
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.json(order);
    } catch (err) {
        console.error("Error retrieving order:", err);
        res.status(500).json({ message: "Error retrieving order", error: err.message });
    }
});

module.exports = router; 