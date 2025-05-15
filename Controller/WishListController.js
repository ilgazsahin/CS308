const express = require('express');
const router = express.Router();
const Wishlist = require('../Models/WishListModel');
const UserModel = require('../Models/UserModel')

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

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.find({ userId }).populate('bookId');
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist', error: err });
  }
});

// Express.js Router
router.delete('/:userId/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;
  try {
    const deleted = await Wishlist.findOneAndDelete({ userId, bookId });
    if (deleted) {
      return res.status(200).json({ message: 'Removed from wishlist' });
    } else {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

module.exports = router;
