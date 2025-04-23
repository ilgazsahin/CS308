// Script to update all books with stock values
require('dotenv').config();
const mongoose = require('mongoose');
const BookModel = require('./Models/BookModel');

const updateBookStock = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/MyLocalBookstore", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    // Fetch all books
    const books = await BookModel.find({});
    console.log(`Found ${books.length} books in the database`);

    if (books.length === 0) {
      console.log('No books found in the database. Please add books first.');
      process.exit(0);
    }

    // Update each book with a random stock value
    const stockUpdates = [];
    for (const book of books) {
      // Generate a random stock between 0 and 20
      const randomStock = Math.floor(Math.random() * 21); // 0 to 20
      
      // Update the book
      book.stock = randomStock;
      await book.save();
      
      stockUpdates.push({
        title: book.title,
        stock: randomStock
      });
    }

    console.log('Stock updates complete:');
    console.table(stockUpdates);

    console.log('All books have been updated with stock values');
  } catch (error) {
    console.error('Error updating book stock:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the update function
updateBookStock(); 