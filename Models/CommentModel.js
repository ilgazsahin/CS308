const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', CommentSchema);
