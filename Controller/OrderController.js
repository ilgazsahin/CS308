const express = require("express");
const router = express.Router();
const OrderModel = require("../Models/OrderModel");
const BookModel = require("../Models/BookModel"); 
const axios = require("axios");

// Get all orders (for admin) - Moving this route to the top
router.get("/", async (req, res) => {
    try {
        const orders = await OrderModel.find({})
            .sort({ orderDate: -1 }); // Sort by date, newest first
        
        res.json(orders);
    } catch (err) {
        console.error("Error retrieving all orders:", err);
        res.status(500).json({ message: "Error retrieving orders", error: err.message });
    }
});

// Create a new order
router.post("/", async (req, res) => {
    try {
        const orderData = req.body;

        // 1. Stock check and decrease
        for (const item of orderData.items) {
            const book = await BookModel.findById(item._id);
            if (!book || book.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Not enough stock for ${book?.title || "unknown book"}` 
                });
            }
        }

        //Decrease stock
        for (const item of orderData.items) {
            const book = await BookModel.findById(item._id);
            book.stock -= item.quantity;
            await book.save();
        }

        //Add default status
        orderData.status = "processing";
        orderData.orderDate = new Date();

        const newOrder = await OrderModel.create(orderData);

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder
        });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ message: "Error creating order", error: err.message });
    }
});

//Get all orders for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const orders = await OrderModel.find({ 
            userId: req.params.userId 
        })
        .sort({ orderDate: -1 }); // Sort by date, newest first
        
        console.log('Found orders:', orders); // Add this for debugging
        
        if (!orders) {
            return res.status(404).json({ message: "No orders found" });
        }
        
        res.json(orders);
    } catch (err) {
        console.error("Error retrieving orders:", err);
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

        const orders = await OrderModel.find({
            userId,
            'items._id': bookId,
            status: 'Paid'
        });

        res.json({ hasPurchased: orders.length > 0 });
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
        const order = await OrderModel.findOne({ 
            orderId: req.params.orderId 
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (err) {
        console.error("Error retrieving order:", err);
        res.status(500).json({ message: "Error retrieving order", error: err.message });
    }
});

// PATCH: Update order status (for admin panel)
// PATCH  /api/orders/:orderId/status
// Controller/OrderController.js  (only the patch route needs changing)

// PATCH  /api/orders/:orderId/status

 router.patch("/:orderId/status", async (req, res) => {
     try {
         const { orderId } = req.params;
         const { status } = req.body;
 
         const validStatuses = ["processing", "in-transit", "delivered"];
         if (!validStatuses.includes(status)) {
             return res.status(400).json({ message: "Invalid status value" });
         }
 
         const updatedOrder = await OrderModel.findOneAndUpdate(
             { orderId: parseInt(orderId) },
             { status },
             { new: true }
         );
 
         if (!updatedOrder) {
             return res.status(404).json({ message: "Order not found" });
         }
 
         res.json({ message: "Order status updated", order: updatedOrder });
     } catch (err) {
         console.error("Error updating order status:", err);
         res.status(500).json({ message: "Error updating order status", error: err.message });
     }
 });
 
 module.exports = router;