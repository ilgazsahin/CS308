const express = require("express");
const router = express.Router();
const OrderModel = require("../Models/OrderModel");
const BookModel = require("../Models/BookModel"); 
const axios = require("axios");
const { sendOrderConfirmation } = require("../utils/emailService");

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
        
        // Send confirmation email if customer email is provided in shippingInfo
        if (orderData.shippingInfo && orderData.shippingInfo.email) {
            try {
                await sendOrderConfirmation(newOrder, orderData.shippingInfo.email);
                console.log(`Order confirmation email sent to ${orderData.shippingInfo.email}`);
            } catch (emailError) {
                console.error("Error sending order confirmation email:", emailError);
                // Continue processing even if email fails
            }
        }

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
         
         // Send status update email if order has customer email in shippingInfo
         if (updatedOrder.shippingInfo && updatedOrder.shippingInfo.email && status === "delivered") {
             try {
                 await sendOrderConfirmation(updatedOrder, updatedOrder.shippingInfo.email);
                 console.log(`Order status update email sent to ${updatedOrder.shippingInfo.email}`);
             } catch (emailError) {
                 console.error("Error sending order status update email:", emailError);
                 // Continue processing even if email fails
             }
         }
 
         res.json({ message: "Order status updated", order: updatedOrder });
     } catch (err) {
         console.error("Error updating order status:", err);
         res.status(500).json({ message: "Error updating order status", error: err.message });
     }
 });

// Test route for email sending (remove in production)
router.post("/test-email", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email address is required" });
        }
        
        // Create a sample order for testing
        const testOrder = {
            _id: "TEST-ORDER-" + Date.now(),
            orderId: Date.now(),
            createdAt: new Date(),
            items: [
                { 
                    _id: "book1", 
                    title: "The Great Gatsby", 
                    author: "F. Scott Fitzgerald",
                    quantity: 2, 
                    price: 19.99,
                    image: "https://example.com/book1.jpg"
                },
                { 
                    _id: "book2", 
                    title: "To Kill a Mockingbird", 
                    author: "Harper Lee",
                    quantity: 1, 
                    price: 14.99,
                    image: "https://example.com/book2.jpg"
                }
            ],
            totalAmount: 54.97,
            total: 54.97,
            shippingInfo: {
                name: "John Doe",
                email: email,
                address: "123 Test Street",
                city: "Test City",
                state: "TS",
                zip: "12345",
                country: "Turkey",
                phone: "555-123-4567"
            },
            status: "processing",
            userId: "user123"
        };
        
        const result = await sendOrderConfirmation(testOrder, email);
        
        if (result.success) {
            res.json({ 
                message: "Test email sent successfully with invoice PDF", 
                details: result 
            });
        } else {
            res.status(500).json({ 
                message: "Failed to send test email", 
                error: result.error 
            });
        }
    } catch (err) {
        console.error("Error sending test email:", err);
        res.status(500).json({ 
            message: "Error sending test email", 
            error: err.message 
        });
    }
});

module.exports = router;