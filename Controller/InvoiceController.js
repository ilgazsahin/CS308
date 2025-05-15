const express = require("express");
const router = express.Router();
const InvoiceModel = require("../Models/InvoiceModel");

// Detaylı hata ayıklama için yardımcı fonksiyon
const logObject = (label, obj) => {
    console.log(`\n----- ${label} -----`);
    console.log(JSON.stringify(obj, null, 2));
    console.log(`----- ${label} SON -----\n`);
};

// Get all invoices for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Fetching invoices for user: ${userId}`);
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const invoices = await InvoiceModel.find({ userId }).sort({ invoiceDate: -1 });
        console.log(`Found ${invoices.length} invoices for user ${userId}`);
        
        res.json(invoices);
    } catch (err) {
        console.error("Error retrieving user invoices:", err);
        res.status(500).json({ message: "Error retrieving user invoices", error: err.message });
    }
});

// Generate a new invoice (FIX)
router.post("/generate", async (req, res) => {
    try {
        console.log("\n===== INVOICE GENERATION STARTED =====");
        const { orderData } = req.body;
        
        if (!orderData) {
            console.log("Error: Order data is missing");
            return res.status(400).json({ message: "Order data is required" });
        }
        
        logObject("Received Order Data", orderData);
        
        // Verify required fields in orderData
        if (!orderData.orderId) {
            console.log("Error: Order ID is missing in orderData");
            return res.status(400).json({ message: "Order ID is required in order data" });
        }
        
        if (!orderData.userId) {
            console.log("Error: User ID is missing in orderData");
            return res.status(400).json({ message: "User ID is required in order data" });
        }
        
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            console.log("Error: Items array is missing or empty in orderData");
            return res.status(400).json({ message: "Items array is required in order data" });
        }
        
        // Convert orderId to string to ensure consistent data type
        const orderIdString = String(orderData.orderId);
        
        // Check if invoice already exists for this order
        console.log(`Checking for existing invoice with orderId: ${orderIdString}`);
        const existingInvoice = await InvoiceModel.findOne({ orderId: orderIdString });
        
        if (existingInvoice) {
            console.log(`Existing invoice found with ID: ${existingInvoice._id}`);
            return res.json(existingInvoice);
        }
        
        console.log("No existing invoice found, creating new invoice...");
        
        // Generate a unique invoice ID
        const invoiceId = `INV-${orderIdString}-${Date.now()}`;
        console.log(`Generated invoice ID: ${invoiceId}`);
        
        // Calculate subtotal properly
        const subtotal = orderData.items.reduce((total, item) => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 1;
            return total + (itemPrice * itemQuantity);
        }, 0);
        
        console.log(`Calculated subtotal: ${subtotal}`);
        
        // Due date is 30 days from invoice date
        const invoiceDate = new Date();
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        
        // Prepare invoice items with proper validation
        const invoiceItems = orderData.items.map(item => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 1;
            
            return {
                _id: item._id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                title: item.title || "Unknown Item",
                author: item.author || "",
                price: itemPrice,
                quantity: itemQuantity,
                subtotal: itemPrice * itemQuantity
            };
        });
        
        logObject("Prepared invoice items", invoiceItems);
        
        // Validate shipping info
        const shippingInfo = orderData.shippingInfo || {};
        
        // Create new invoice with proper type checking for all fields
        const newInvoice = new InvoiceModel({
            invoiceId,
            orderId: orderIdString,
            userId: String(orderData.userId),
            invoiceDate,
            dueDate,
            items: invoiceItems,
            shippingInfo: {
                name: shippingInfo.name || "",
                email: shippingInfo.email || "",
                address: shippingInfo.address || "",
                city: shippingInfo.city || "",
                state: shippingInfo.state || "",
                zip: shippingInfo.zip || "",
                country: shippingInfo.country || "",
                phone: shippingInfo.phone || ""
            },
            subtotal,
            total: parseFloat(orderData.total) || subtotal,
            status: "Paid",
            notes: "Thank you for your purchase!",
        });

        logObject("Attempting to save invoice", newInvoice);
        
        try {
            const savedInvoice = await newInvoice.save();
            console.log(`Invoice saved successfully with ID: ${savedInvoice._id}`);
            console.log("===== INVOICE GENERATION COMPLETED =====\n");
            return res.status(201).json(savedInvoice);
        } catch (saveErr) {
            console.error("MongoDB Save Error:", saveErr);
            console.log("Error Details:", saveErr.message);
            if (saveErr.name === 'ValidationError') {
                // Log specific validation errors
                Object.keys(saveErr.errors).forEach(field => {
                    console.log(`Validation error in field '${field}':`, saveErr.errors[field].message);
                });
                return res.status(400).json({ 
                    message: "Validation error when saving invoice", 
                    validationErrors: saveErr.errors,
                    error: saveErr.message
                });
            }
            return res.status(500).json({ 
                message: "Error saving invoice to database", 
                error: saveErr.message,
                stack: saveErr.stack
            });
        }
    } catch (err) {
        console.error("General Error in generate invoice route:", err);
        console.log("===== INVOICE GENERATION FAILED =====\n");
        res.status(500).json({ 
            message: "Error generating invoice", 
            error: err.message,
            stack: err.stack
        });
    }
});

// Get an invoice by invoiceId
router.get("/:invoiceId", async (req, res) => {
    try {
        const { invoiceId } = req.params;
        console.log(`Looking up invoice by ID: ${invoiceId}`);
        
        if (!invoiceId) {
            return res.status(400).json({ message: "Invoice ID is required" });
        }
        
        const invoice = await InvoiceModel.findOne({ invoiceId });
        
        if (!invoice) {
            console.log(`Invoice not found with ID: ${invoiceId}`);
            return res.status(404).json({ message: "Invoice not found" });
        }
        
        console.log(`Invoice found: ${invoice._id}`);
        res.json(invoice);
    } catch (err) {
        console.error("Error retrieving invoice:", err);
        res.status(500).json({ message: "Error retrieving invoice", error: err.message });
    }
});

// Get an invoice by orderId
router.get("/order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log(`Looking up invoice by order ID: ${orderId}`);
        
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        
        // Convert orderId to string to match how we store it
        const orderIdString = String(orderId);
        console.log(`Searching for orderId (as string): ${orderIdString}`);
        
        const invoice = await InvoiceModel.findOne({ orderId: orderIdString });
        
        if (!invoice) {
            console.log(`No invoice found for order ID: ${orderIdString}`);
            return res.status(404).json({ message: "Invoice not found for this order" });
        }
        
        console.log(`Invoice found for order: ${invoice._id}`);
        res.json(invoice);
    } catch (err) {
        console.error("Error retrieving invoice by order ID:", err);
        res.status(500).json({ message: "Error retrieving invoice", error: err.message });
    }
});
router.get("/id/:id", async (req, res) => {
    try {
      const invoice = await InvoiceModel.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      console.error("Error retrieving invoice by MongoDB ID:", err);
      res.status(500).json({ message: "Error retrieving invoice", error: err.message });
    }
  });
  
module.exports = router;