// Models/CommentModel.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book' // matches the 'Book' model in BookModel.js
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' // matches the 'users' model in UserModel.js
  },
  text: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('comments', CommentSchema);
// This will create/connect to a "comments" collection
