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
        required: true,  // change to false or add a default if needed
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Book', BookSchema);
