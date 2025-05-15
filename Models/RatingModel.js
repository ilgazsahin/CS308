const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book',
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove any compound indexes that might create uniqueness constraints
mongoose.model('ratings', RatingSchema).collection.dropIndexes().catch(err => {
    console.log('Error dropping indexes:', err);
});

module.exports = mongoose.model('ratings', RatingSchema); 