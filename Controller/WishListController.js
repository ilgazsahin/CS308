const express = require('express');
const router = express.Router();
const Wishlist = require('../Models/WishListModel');

router.post('/', async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const exists = await Wishlist.findOne({ userId, bookId });
    if (exists) {
      return res.status(409).json({ message: 'Already in wishlist' });
    }

    const newItem = new Wishlist({ userId, bookId });
    await newItem.save();

    res.status(201).json({ message: 'Added to wishlist', item: newItem });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist', error: err });
  }
});



module.exports = router;
