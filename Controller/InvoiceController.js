const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define Invoice Schema
const InvoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    items: [{
        _id: String,
        title: String,
        author: String,
        price: Number,
        quantity: Number,
        subtotal: Number
    }],
    shippingInfo: {
        name: String,
        email: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String
    },
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: "Credit Card"
    },
    status: {
        type: String,
        enum: ["Paid", "Pending", "Overdue", "Cancelled"],
        default: "Paid"
    },
    notes: String,
    pdfUrl: String
}, { timestamps: true });

// Create Invoice model if not exists
let InvoiceModel;
try {
    InvoiceModel = mongoose.model('Invoice');
} catch (error) {
    InvoiceModel = mongoose.model('Invoice', InvoiceSchema);
}

// Get an invoice by invoiceId
router.get("/:invoiceId", async (req, res) => {
    try {
        const { invoiceId } = req.params;
        
        if (!invoiceId) {
            return res.status(400).json({ message: "Invoice ID is required" });
        }
        
        const invoice = await InvoiceModel.findOne({ invoiceId });
        
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        
        res.json(invoice);
    } catch (err) {
        console.error("Error retrieving invoice:", err);
        res.status(500).json({ message: "Error retrieving invoice", error: err.message });
    }
});

// Get all invoices for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const invoices = await InvoiceModel.find({ userId }).sort({ invoiceDate: -1 });
        
        res.json(invoices);
    } catch (err) {
        console.error("Error retrieving user invoices:", err);
        res.status(500).json({ message: "Error retrieving user invoices", error: err.message });
    }
});

// Generate and store a new invoice from order data
router.post("/generate", async (req, res) => {
    try {
        const { orderData } = req.body;
        
        if (!orderData) {
            return res.status(400).json({ message: "Order data is required" });
        }
        
        // Check if invoice already exists for this order
        const existingInvoice = await InvoiceModel.findOne({ orderId: orderData.orderId });
        
        if (existingInvoice) {
            return res.json(existingInvoice);
        }
        
        // Generate a unique invoice ID (INV-[ORDER_ID]-[TIMESTAMP])
        const invoiceId = `INV-${orderData.orderId}-${Date.now()}`;
        
        // Calculate additional invoice fields if needed
        const subtotal = orderData.items.reduce((total, item) => 
            total + (parseFloat(item.price) * item.quantity), 0);
        
        // Due date is 30 days from invoice date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        // Prepare invoice items with subtotals
        const invoiceItems = orderData.items.map(item => ({
            ...item,
            subtotal: parseFloat(item.price) * item.quantity
        }));
        
        // Create new invoice
        const newInvoice = new InvoiceModel({
            invoiceId,
            orderId: orderData.orderId,
            userId: orderData.userId,
            invoiceDate: new Date(),
            dueDate,
            items: invoiceItems,
            shippingInfo: orderData.shippingInfo,
            subtotal,
            total: orderData.total,
            status: "Paid",
            notes: "Thank you for your purchase!",
        });
        
        await newInvoice.save();
        
        res.status(201).json(newInvoice);
    } catch (err) {
        console.error("Error generating invoice:", err);
        res.status(500).json({ message: "Error generating invoice", error: err.message });
    }
});

// Get an invoice by orderId
router.get("/order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        
        const invoice = await InvoiceModel.findOne({ orderId: parseInt(orderId) });
        
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found for this order" });
        }
        
        res.json(invoice);
    } catch (err) {
        console.error("Error retrieving invoice by order ID:", err);
        res.status(500).json({ message: "Error retrieving invoice", error: err.message });
    }
});

module.exports = router; 