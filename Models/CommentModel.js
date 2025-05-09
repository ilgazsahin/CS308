// Models/CommentModel.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book',
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false  // Comments are hidden by default until manually approved
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove any compound indexes that might create uniqueness constraints
mongoose.model('comments', CommentSchema).collection.dropIndexes().catch(err => {
    console.log('Error dropping indexes:', err);
});

module.exports = mongoose.model('comments', CommentSchema);
// This will create/connect to a "comments" collection
