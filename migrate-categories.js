// migrate-categories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./Models/BookModel');
const CategoryModel = require('./Models/CategoryModel');

async function migrateCategoriesAndUpdateBooks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all unique category values from books
    const result = await Book.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`Found ${result.length} unique categories`);

    // Create a mapping of old category names to new category objects
    const categoryMap = {};

    for (const item of result) {
      if (!item._id) continue; // Skip null or undefined categories
      
      // Create the category in the new collection
      const newCategory = await CategoryModel.create({
        name: item._id,
        description: `Books in the ${item._id} category`
      });
      
      categoryMap[item._id] = newCategory._id;
      console.log(`Created category: ${item._id} (${newCategory._id})`);
    }

    // Update all books to use the new category references
    let updatedCount = 0;
    const books = await Book.find();
    
    for (const book of books) {
      if (book.category && categoryMap[book.category]) {
        book.category = categoryMap[book.category];
        await book.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} books with new category references`);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

migrateCategoriesAndUpdateBooks(); 