const express = require("express");
const router = express.Router();
const OrderModel = require("../Models/OrderModel");
const BookModel = require("../Models/BookModel"); 
const axios = require("axios");
const { sendOrderConfirmation, sendRefundApprovalEmail } = require("../utils/emailService");

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
router.patch("/:orderId/status", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Update the valid statuses to match exactly what's expected
        const validStatuses = ["processing", "in-transit", "delivered", "cancelled", "refund-requested", "refunded"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value. Valid values are: processing, in-transit, delivered, cancelled, refund-requested, refunded" });
        }

        // Use MongoDB _id for updating instead of orderId field
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
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

// POST: Cancel an order
// POST /api/orders/:orderId/cancel
router.post("/:orderId/cancel", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Get the order
        const order = await OrderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the user owns this order
        if (order.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to cancel this order" });
        }

        // Check if the order can be cancelled (must be in "processing" status)
        if (order.status !== "processing") {
            return res.status(400).json({ 
                message: "Only orders in 'processing' status can be cancelled",
                currentStatus: order.status
            });
        }

        // Update order status to cancelled
        order.status = "cancelled";
        await order.save();

        // Return stock to inventory
        for (const item of order.items) {
            const book = await BookModel.findById(item._id);
            if (book) {
                book.stock += item.quantity;
                await book.save();
                console.log(`Restored ${item.quantity} units of "${book.title}" to stock`);
            }
        }

        res.json({ 
            message: "Order cancelled successfully", 
            order: order 
        });
    } catch (err) {
        console.error("Error cancelling order:", err);
        res.status(500).json({ message: "Error cancelling order", error: err.message });
    }
});

// POST: Request a refund
// POST /api/orders/:orderId/refund-request
router.post("/:orderId/refund-request", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId, reason } = req.body;

        console.log('Refund request received:', { orderId, userId, reason });

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ message: "Refund reason is required" });
        }

        // Try to find order by MongoDB _id first
        let order = await OrderModel.findById(orderId);
        
        // If not found, try to find by orderId field
        if (!order) {
            order = await OrderModel.findOne({ orderId: orderId });
        }

        if (!order) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ message: "Order not found" });
        }

        console.log('Order found:', {
            id: order._id,
            orderId: order.orderId,
            status: order.status,
            userId: order.userId
        });

        // Check if the user owns this order
        if (order.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to request a refund for this order" });
        }

        // Check if the order can be refunded (must be in "delivered" status)
        if (order.status.toLowerCase() !== "delivered") {
            return res.status(400).json({ 
                message: "Only orders in 'delivered' status can be refunded",
                currentStatus: order.status
            });
        }

        // Check if the order is within 30 days for refund eligibility
        const orderDate = new Date(order.orderDate || order.createdAt);
        const today = new Date();
        const daysDifference = Math.ceil((today - orderDate) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 30) {
            return res.status(400).json({ 
                message: "Refund requests must be made within 30 days of purchase",
                daysSincePurchase: daysDifference
            });
        }

        // Update order with refund request information
        order.status = "refund-requested";
        order.refundRequest = {
            requestedAt: new Date(),
            reason: reason,
            status: "pending",
            refundAmount: order.total // Default to full refund
        };
        
        await order.save();
        console.log('Refund request saved successfully');

        res.json({ 
            message: "Refund request submitted successfully", 
            order: order 
        });
    } catch (err) {
        console.error("Error requesting refund:", err);
        res.status(500).json({ message: "Error requesting refund", error: err.message });
    }
});

// PATCH: Process a refund request (for sales managers)
// PATCH /api/orders/:orderId/process-refund
router.patch("/:orderId/process-refund", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { approved, processorId, notes, refundAmount } = req.body;

        if (!processorId) {
            return res.status(400).json({ message: "Processor ID (sales manager) is required" });
        }

        // Get the order
        const order = await OrderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the order has a pending refund request
        if (order.status !== "refund-requested" || !order.refundRequest) {
            return res.status(400).json({ 
                message: "This order does not have a pending refund request",
                currentStatus: order.status
            });
        }

        // Update refund request status based on approval
        order.refundRequest.status = approved ? "approved" : "rejected";
        order.refundRequest.processedAt = new Date();
        order.refundRequest.processedBy = processorId;
        
        if (notes) {
            order.refundRequest.notes = notes;
        }
        
        // If approved, update refund amount if provided
        if (approved) {
            if (refundAmount !== undefined && refundAmount >= 0 && refundAmount <= order.total) {
                order.refundRequest.refundAmount = refundAmount;
            }
            
            // Update order status to refunded
            order.status = "refunded";
            
            // Return stock to inventory
            for (const item of order.items) {
                const book = await BookModel.findById(item._id);
                if (book) {
                    book.stock += item.quantity;
                    await book.save();
                    console.log(`Restored ${item.quantity} units of "${book.title}" to stock`);
                }
            }
            
            // Send refund approval email to customer
            if (order.shippingInfo && order.shippingInfo.email) {
                try {
                    await sendRefundApprovalEmail(order, order.shippingInfo.email);
                    console.log(`Refund approval email sent to ${order.shippingInfo.email}`);
                } catch (emailError) {
                    console.error("Error sending refund approval email:", emailError);
                    // Continue processing even if email fails
                }
            }
        }
        
        await order.save();

        res.json({ 
            message: approved ? "Refund approved and processed successfully" : "Refund request rejected", 
            order: order 
        });
    } catch (err) {
        console.error("Error processing refund:", err);
        res.status(500).json({ message: "Error processing refund", error: err.message });
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