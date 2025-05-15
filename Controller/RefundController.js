const express = require('express');
const router = express.Router();
const RefundRequest = require('../Models/RefundModel');
const Order = require('../Models/OrderModel'); 
const { sendRefundNotification } = require("../utils/refundEmail");
// Create refund request
router.post('/', async (req, res) => {
  const { orderId, userId, reason } = req.body;
  try {
    const existing = await RefundRequest.findOne({ orderId, userId });
    if (existing) {
      return res.status(400).json({ message: 'Refund already requested.' });
    }

    const newRequest = new RefundRequest({ orderId, userId, reason });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Error creating refund request', error: err });
  }
});

// Admin: get all refund requests
router.get('/', async (req, res) => {
  try {
    const requests = await RefundRequest.find();
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});
// routes/refundRequests.js içine ekle
router.get('/user/:userId', async (req, res) => {
    try {
      const userRefunds = await RefundRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
      res.status(200).json(userRefunds);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user refunds' });
    }
  });
  
  router.put('/:id', async (req, res) => {
    const { status } = req.body;
  
    try {
      const refund = await RefundRequest.findById(req.params.id);
      if (!refund) return res.status(404).json({ message: 'Refund not found' });
  
      refund.status = status;
      await refund.save();
  
      // Mail sadece approved ya da rejected olduğunda gönderilmeli
      if (status === 'approved' || status === 'rejected') {
        const order = await Order.findById(refund.orderId);
        if (order && order.shippingInfo?.email) {
          await sendRefundNotification(
            {
              refundedAmount: order.total,
              status: refund.status
            },
            order.shippingInfo.email,
            order.shippingInfo.name || 'Customer'
          );
        }
      }
  
      res.status(200).json(refund);
    } catch (err) {
      console.error("Refund status update error:", err);
      res.status(500).json({ message: 'Error updating refund status' });
    }
  });


module.exports = router;
