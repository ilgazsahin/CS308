const mongoose = require('mongoose');
const BookModel = require('../Models/BookModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MyLocalBookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Category mapping based on book titles, authors, or themes
const categoryMapping = [
  { 
    titles: ['gatsby', 'mockingbird', 'rye', 'dalloway', '1984', 'animal farm', 'brave new world', 
             'ulysses', 'sound and the fury', 'jane eyre', 'wuthering heights', 'pride and prejudice',
             'moby dick', 'grapes of wrath', 'crime and punishment', 'anna karenina', 'war and peace'],
    category: 'Classic'
  },
  {
    titles: ['harry potter', 'lord of the rings', 'hobbit', 'narnia', 'wheel of time', 'game of thrones',
             'eragon', 'percy jackson', 'his dark materials', 'earthsea'],
    category: 'Fantasy'
  },
  {
    titles: ['dune', 'foundation', 'neuromancer', 'ender', 'hitchhiker', 'ready player',
             'martian', 'fahrenheit', 'star wars', 'star trek', 'blade runner'],
    category: 'Science Fiction'
  },
  {
    titles: ['gone girl', 'girl on the train', 'da vinci code', 'sherlock holmes', 'and then there were none',
             'murder on the orient', 'in the woods', 'silent patient'],
    category: 'Mystery'
  },
  {
    titles: ['brief history of time', 'cosmos', 'sapiens', 'freakonomics', 'thinking fast and slow',
             'outliers', 'guns germs and steel', 'origin of species'],
    category: 'Non-Fiction'
  },
  {
    titles: ['twilight', 'fault in our stars', 'notebook', 'me before you', 'outlander', 'bridgerton',
             'pride and prejudice', 'jane eyre'],
    category: 'Romance'
  }
];

// Function to determine category based on book data
function determineCategory(book) {
  const titleLower = book.title.toLowerCase();
  const authorLower = book.author.toLowerCase();
  const descriptionLower = book.description.toLowerCase();
  
  // Check title against our mapping
  for (const mapping of categoryMapping) {
    for (const keyword of mapping.titles) {
      if (titleLower.includes(keyword) || 
          descriptionLower.includes(keyword) ||
          authorLower.includes(keyword)) {
        return mapping.category;
      }
    }
  }
  
  // Specific author mappings
  if (authorLower.includes('king') || authorLower.includes('lovecraft') || authorLower.includes('poe')) {
    return 'Horror';
  }
  
  if (authorLower.includes('tolkien') || authorLower.includes('martin') || authorLower.includes('rowling')) {
    return 'Fantasy';
  }
  
  if (authorLower.includes('christie') || authorLower.includes('doyle')) {
    return 'Mystery';
  }
  
  // Default to Fiction if no specific category is found
  return 'Fiction';
}

async function updateBookCategories() {
  try {
    // Get all books
    const books = await BookModel.find();
    console.log(`Found ${books.length} books to update`);
    
    let updateCount = 0;
    
    // Update each book with a category
    for (const book of books) {
      // Skip if already has a category other than 'Other'
      if (book.category && book.category !== 'Other') {
        console.log(`Book "${book.title}" already has category: ${book.category}`);
        continue;
      }
      
      const category = determineCategory(book);
      console.log(`Assigning category "${category}" to book: ${book.title}`);
      
      // Update the book
      book.category = category;
      await book.save();
      updateCount++;
    }
    
    console.log(`Successfully updated ${updateCount} books with categories`);
  } catch (error) {
    console.error('Error updating book categories:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the update
updateBookCategories(); 