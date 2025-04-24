const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true
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
    status: {
        type: String,
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema); 