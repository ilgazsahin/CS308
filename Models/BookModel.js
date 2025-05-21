const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    publishedYear: {
        type: Number,
        default: null,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: false,  // Changed to false so books can be added without a price
        default: null     // Default to null until sales manager sets the price
    },
    stock: {
        type: Number,
        default: 10,     // Default stock of 10 items
        min: 0           // Stock cannot be negative
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Book', BookSchema);
