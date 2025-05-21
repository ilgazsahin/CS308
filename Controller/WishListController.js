const express = require('express');
const router = express.Router();
const Wishlist = require('../Models/WishListModel');
const mongoose = require('mongoose');

// Add an item to wishlist
router.post('/', async (req, res) => {
  const { userId, bookId } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ message: 'User ID and Book ID are required' });
  }

  try {
    // Check if already in wishlist
    const exists = await Wishlist.findOne({ userId, bookId });
    if (exists) {
      return res.status(200).json({ message: 'Already in wishlist', item: exists });
    }

    const newItem = new Wishlist({ userId, bookId });
    await newItem.save();

    res.status(201).json({ message: 'Added to wishlist', item: newItem });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
  }
});

// Get user's wishlist
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const wishlist = await Wishlist.find({ userId }).populate('bookId');
    res.status(200).json(wishlist);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
  }
});

// Remove item from wishlist
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Wishlist item ID is required' });
  }

  try {
    const item = await Wishlist.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    
    res.status(200).json({ message: 'Removed from wishlist', item });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
});

// Remove item from wishlist by user and book ID
router.delete('/user/:userId/book/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;

  if (!userId || !bookId) {
    return res.status(400).json({ message: 'User ID and Book ID are required' });
  }

  try {
    const item = await Wishlist.findOneAndDelete({ userId, bookId });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not in wishlist' });
    }
    
    res.status(200).json({ message: 'Removed from wishlist', item });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
});

// Clear all items from a user's wishlist
router.delete('/clear/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await Wishlist.deleteMany({ userId });
    res.status(200).json({ 
      message: 'Wishlist cleared', 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error('Error clearing wishlist:', err);
    res.status(500).json({ message: 'Error clearing wishlist', error: err.message });
  }
});

// Check if a book is in the user's wishlist
router.get('/check/:userId/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;

  if (!userId || !bookId) {
    return res.status(400).json({ message: 'User ID and Book ID are required' });
  }

  try {
    const item = await Wishlist.findOne({ userId, bookId });
    res.status(200).json({ 
      isInWishlist: !!item,
      item: item || null
    });
  } catch (err) {
    console.error('Error checking wishlist item:', err);
    res.status(500).json({ message: 'Error checking wishlist item', error: err.message });
  }
});

module.exports = router;
