// add-test-categories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./Models/BookModel');
const CategoryModel = require('./Models/CategoryModel');

async function addTestCategoriesAndUpdateBooks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create test categories
    const categories = [
      { name: 'Fiction', description: 'Fictional books and novels' },
      { name: 'Non-Fiction', description: 'Factual books and biographies' },
      { name: 'Science Fiction', description: 'Books about futuristic concepts' },
      { name: 'Fantasy', description: 'Books with magical or supernatural elements' },
      { name: 'Mystery', description: 'Books featuring suspense and detective work' },
      { name: 'Thriller', description: 'Exciting books designed to thrill the reader' },
      { name: 'Romance', description: 'Books focusing on romantic relationships' },
      { name: 'Classic', description: 'Books considered classic literature' }
    ];

    // Clear existing categories
    await CategoryModel.deleteMany({});
    console.log('Deleted existing categories');

    // Add new categories
    const savedCategories = {};
    for (const category of categories) {
      const newCategory = await CategoryModel.create(category);
      savedCategories[category.name] = newCategory;
      console.log(`Created category: ${category.name} (${newCategory._id})`);
    }

    // Get all books
    const books = await Book.find();
    console.log(`Found ${books.length} books`);

    // Assign random categories to books
    let updatedCount = 0;
    for (const book of books) {
      // Get a random category
      const categoryNames = Object.keys(savedCategories);
      const randomCategory = savedCategories[categoryNames[Math.floor(Math.random() * categoryNames.length)]];
      
      // Update the book
      book.category = randomCategory._id;
      await book.save();
      updatedCount++;
      
      console.log(`Assigned category ${randomCategory.name} to book "${book.title}"`);
    }

    console.log(`Updated ${updatedCount} books with categories`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

addTestCategoriesAndUpdateBooks(); 