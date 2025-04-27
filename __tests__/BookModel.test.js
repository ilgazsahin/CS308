const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BookModel = require('../Models/BookModel');

let mongoServer;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clean up books between tests
    await BookModel.deleteMany({});
});

describe('BookModel', () => {
    test('should create & save a book successfully', async () => {
        const bookData = {
            title: 'Test Book',
            author: 'Test Author',
            description: 'This is a test book',
            publishedYear: 2023,
            image: 'https://example.com/test.jpg',
            price: 19.99,
            stock: 10,
            category: 'Fiction'
        };

        const book = new BookModel(bookData);
        const savedBook = await book.save();
        
        // Verify saved book
        expect(savedBook._id).toBeDefined();
        expect(savedBook.title).toBe(bookData.title);
        expect(savedBook.author).toBe(bookData.author);
        expect(savedBook.price).toBe(bookData.price);
        expect(savedBook.stock).toBe(bookData.stock);
        expect(savedBook.category).toBe(bookData.category);
    });

    test('should not save a book without required fields', async () => {
        const bookWithoutTitle = new BookModel({
            author: 'Test Author',
            image: 'https://example.com/test.jpg',
            price: 19.99
        });

        let err;
        try {
            await bookWithoutTitle.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.title).toBeDefined();
    });

    test('should get a book with a specific ID', async () => {
        // Create a book
        const book = new BookModel({
            title: 'Test Book',
            author: 'Test Author',
            image: 'https://example.com/test.jpg',
            price: 19.99,
            stock: 10,
            category: 'Fiction'
        });
        const savedBook = await book.save();

        // Find book by ID
        const foundBook = await BookModel.findById(savedBook._id);
        
        expect(foundBook).not.toBeNull();
        expect(foundBook.title).toBe('Test Book');
        expect(foundBook._id.toString()).toBe(savedBook._id.toString());
    });

    test('should update a book', async () => {
        // Create a book
        const book = new BookModel({
            title: 'Original Title',
            author: 'Original Author',
            image: 'https://example.com/test.jpg',
            price: 19.99,
            stock: 10,
            category: 'Fiction'
        });
        const savedBook = await book.save();

        // Update book
        const updatedBook = await BookModel.findByIdAndUpdate(
            savedBook._id,
            { 
                title: 'Updated Title',
                price: 29.99
            },
            { new: true }
        );
        
        expect(updatedBook.title).toBe('Updated Title');
        expect(updatedBook.price).toBe(29.99);
        expect(updatedBook.author).toBe('Original Author'); // unchanged
    });

    test('should delete a book', async () => {
        // Create a book
        const book = new BookModel({
            title: 'Book to Delete',
            author: 'To Be Deleted',
            image: 'https://example.com/test.jpg',
            price: 19.99,
            stock: 10,
            category: 'Fiction'
        });
        const savedBook = await book.save();

        // Delete book
        await BookModel.findByIdAndDelete(savedBook._id);
        
        // Try to find the deleted book
        const deletedBook = await BookModel.findById(savedBook._id);
        expect(deletedBook).toBeNull();
    });

    test('should enforce category enum values', async () => {
        const bookWithInvalidCategory = new BookModel({
            title: 'Invalid Category Book',
            author: 'Test Author',
            image: 'https://example.com/test.jpg',
            price: 19.99,
            category: 'InvalidCategory'
        });

        let err;
        try {
            await bookWithInvalidCategory.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.category).toBeDefined();
    });
}); 