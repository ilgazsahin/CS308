const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true,
        unique: true
    },
    orderNumber: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    },
    items: [{
        _id: String,
        title: String,
        author: String,
        price: Number,
        image: String,
        quantity: Number
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
    total: {
        type: Number,
        required: true
    },
    /** Updated enum with cancelled and refund related statuses */
    status: {
        type: String,
        enum: ['processing', 'in-transit', 'delivered', 'cancelled', 'refund-requested', 'refunded'],
        default: 'processing',
        lowercase: true       // guarantees stored values are lower-case
    },
    refundRequest: {
        requestedAt: Date,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        processedAt: Date,
        processedBy: String, // Sales Manager's userId
        refundAmount: Number,
        notes: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema); 