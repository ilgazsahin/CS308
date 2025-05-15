// models/RefundRequest.js
const mongoose = require('mongoose');

const RefundRequestSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: "Not specified"
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('RefundModel', RefundRequestSchema);
