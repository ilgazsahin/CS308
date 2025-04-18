const mongoose = require('mongoose');

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

module.exports = mongoose.model('Invoice', InvoiceSchema); 