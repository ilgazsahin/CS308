const express = require("express");
const router = express.Router();
const OrderModel = require("../Models/OrderModel");
const BookModel = require("../Models/BookModel");
const InvoiceModel = require("../Models/InvoiceModel");
const { sendOrderConfirmation } = require("../utils/emailService");

// Get all orders (for admin)
router.get("/", async (req, res) => {
  try {
    const orders = await OrderModel.find({}).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error retrieving all orders:", err);
    res.status(500).json({ message: "Error retrieving orders", error: err.message });
  }
});

// Get all orders for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await OrderModel.find({ userId: req.params.userId }).sort({ orderDate: -1 });
    if (!orders) return res.status(404).json({ message: "No orders found" });
    res.json(orders);
  } catch (err) {
    console.error("Error retrieving orders:", err);
    res.status(500).json({ message: "Error retrieving orders", error: err.message });
  }
});

// Create new order and save invoice
router.post("/", async (req, res) => {
  try {
    const orderData = req.body;

    // Stock control
    for (const item of orderData.items) {
      const book = await BookModel.findById(item._id);
      if (!book || book.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${book?.title || "unknown book"}` });
      }
    }

    // Reduce stock
    for (const item of orderData.items) {
      const book = await BookModel.findById(item._id);
      book.stock -= item.quantity;
      await book.save();
    }

    // Create Order
    orderData.status = "processing";
    orderData.orderDate = new Date();
    const newOrder = await OrderModel.create(orderData);

    // Create Invoice
    try {
      const invoiceId = `INV-${newOrder.orderId}-${Date.now()}`;
      const subtotal = newOrder.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = new InvoiceModel({
        invoiceId,
        orderId: newOrder.orderId,
        userId: newOrder.userId,
        invoiceDate: new Date(),
        dueDate,
        items: newOrder.items.map(item => ({
          ...item,
          subtotal: item.price * item.quantity
        })),
        shippingInfo: newOrder.shippingInfo,
        subtotal,
        total: newOrder.total,
        status: "Paid",
        notes: "Thank you for your purchase!"
      });

      await invoice.save();
      console.log("✔️ Invoice saved to MongoDB:", invoice.invoiceId);
    } catch (invoiceErr) {
      console.error("❌ Failed to save invoice:", invoiceErr.message);
    }

    // Send confirmation email
    if (newOrder.shippingInfo?.email) {
      try {
        await sendOrderConfirmation(newOrder, newOrder.shippingInfo.email);
        console.log(`📧 Email sent to ${newOrder.shippingInfo.email}`);
      } catch (emailErr) {
        console.error("❌ Failed to send email:", emailErr.message);
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

// Check if user purchased a book
router.get("/check-purchase", async (req, res) => {
  const { userId, bookId } = req.query;
  if (!userId || !bookId) {
    return res.status(400).json({ message: "Missing parameters", hasPurchased: false });
  }

  try {
    const orders = await OrderModel.find({
      userId,
      'items._id': bookId,
      status: 'Paid'
    });
    res.json({ hasPurchased: orders.length > 0 });
  } catch (err) {
    console.error("Error checking purchase:", err);
    res.status(500).json({ message: "Error checking purchase", error: err.message, hasPurchased: false });
  }
});

// Get a specific order by orderId
router.get("/:orderId", async (req, res) => {
  try {
    const order = await OrderModel.findOne({ orderId: parseInt(req.params.orderId) });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error retrieving order:", err);
    res.status(500).json({ message: "Error retrieving order", error: err.message });
  }
});

// Update order status
router.patch("/:orderId/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["processing", "in-transit", "delivered"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderId: parseInt(req.params.orderId) },
      { status },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    // Optional: email if delivered
    if (status === "delivered" && updatedOrder.shippingInfo?.email) {
      try {
        await sendOrderConfirmation(updatedOrder, updatedOrder.shippingInfo.email);
        console.log(`📦 Delivery email sent to ${updatedOrder.shippingInfo.email}`);
      } catch (err) {
        console.error("Failed to send delivery update email:", err.message);
      }
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});

module.exports = router;
