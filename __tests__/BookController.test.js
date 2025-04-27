const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BookModel = require('../Models/BookModel');
const bookRouter = require('../Controller/BookController');

let app;
let mongoServer;
let testBookId;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Setup Express app with JSON and book routes
    app = express();
    app.use(express.json());
    app.use('/api/books', bookRouter);

    // Create a test book to use in tests
    const testBook = new BookModel({
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        publishedYear: 2023,
        image: 'https://example.com/test.jpg',
        price: 19.99,
        stock: 10,
        category: 'Fiction'
    });
    const savedBook = await testBook.save();
    testBookId = savedBook._id.toString();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('BookController API', () => {
    test('GET /api/books should return all books', async () => {
        const response = await request(app).get('/api/books');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].title).toBe('Test Book');
    });

    test('GET /api/books/:id should return a specific book', async () => {
        const response = await request(app).get(`/api/books/${testBookId}`);
        
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(testBookId);
        expect(response.body.title).toBe('Test Book');
        expect(response.body.author).toBe('Test Author');
    });

    test('GET /api/books/:id with invalid ID should return 404', async () => {
        const response = await request(app).get('/api/books/612345678901234567890123');
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Book not found');
    });

    test('GET /api/books/categories should return all categories', async () => {
        const response = await request(app).get('/api/books/categories');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toContain('Fiction');
    });

    test('POST /api/books should create a new book', async () => {
        const newBook = {
            title: 'New Test Book',
            author: 'New Author',
            description: 'New Description',
            publishedYear: 2024,
            image: 'https://example.com/new.jpg',
            price: 24.99,
            stock: 5,
            category: 'Non-Fiction'
        };

        const response = await request(app)
            .post('/api/books')
            .send(newBook);
        
        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.title).toBe(newBook.title);
        expect(response.body.author).toBe(newBook.author);
        expect(response.body.price).toBe(newBook.price);

        // Verify book is in database
        const savedBook = await BookModel.findById(response.body._id);
        expect(savedBook).not.toBeNull();
        expect(savedBook.title).toBe(newBook.title);
    });

    test('PUT /api/books/:id should update a book', async () => {
        const updates = {
            title: 'Updated Test Book',
            price: 29.99
        };

        const response = await request(app)
            .put(`/api/books/${testBookId}`)
            .send(updates);
        
        expect(response.status).toBe(200);
        expect(response.body.book._id).toBe(testBookId);
        expect(response.body.book.title).toBe(updates.title);
        expect(response.body.book.price).toBe(updates.price);
        // Should keep other fields
        expect(response.body.book.author).toBe('Test Author');

        // Verify book updated in database
        const updatedBook = await BookModel.findById(testBookId);
        expect(updatedBook.title).toBe(updates.title);
        expect(updatedBook.price).toBe(updates.price);
    });

    test('PATCH /api/books/:id/stock should update book stock', async () => {
        const stockUpdate = {
            stock: 15
        };

        const response = await request(app)
            .patch(`/api/books/${testBookId}/stock`)
            .send(stockUpdate);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Stock updated successfully');
        expect(response.body.stock).toBe(stockUpdate.stock);

        // Verify stock updated in database
        const updatedBook = await BookModel.findById(testBookId);
        expect(updatedBook.stock).toBe(stockUpdate.stock);
    });

    test('POST /api/books/decrease-stock should decrease multiple books stock', async () => {
        // First, create a second book
        const secondBook = new BookModel({
            title: 'Second Book',
            author: 'Another Author',
            image: 'https://example.com/second.jpg',
            price: 14.99,
            stock: 8,
            category: 'Mystery'
        });
        const savedSecondBook = await secondBook.save();

        const items = [
            { _id: testBookId, quantity: 2 },
            { _id: savedSecondBook._id.toString(), quantity: 3 }
        ];

        const response = await request(app)
            .post('/api/books/decrease-stock')
            .send({ items });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Stock updated successfully');
        expect(response.body.updates.length).toBe(2);

        // Verify stock updated in database
        const firstBook = await BookModel.findById(testBookId);
        expect(firstBook.stock).toBe(13); // 15 - 2
        
        const secondBookUpdated = await BookModel.findById(savedSecondBook._id);
        expect(secondBookUpdated.stock).toBe(5); // 8 - 3
    });

    test('POST /api/books/decrease-stock should handle insufficient stock', async () => {
        // Create a book with low stock
        const lowStockBook = new BookModel({
            title: 'Low Stock Book',
            author: 'Low Stock Author',
            image: 'https://example.com/low.jpg',
            price: 9.99,
            stock: 1,
            category: 'Fiction'
        });
        const savedLowBook = await lowStockBook.save();

        const items = [
            { _id: savedLowBook._id.toString(), quantity: 5 }
        ];

        const response = await request(app)
            .post('/api/books/decrease-stock')
            .send({ items });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Some stock updates failed');
        expect(response.body.errors.length).toBe(1);
        expect(response.body.errors[0].error).toBe('Insufficient stock');
        
        // Verify stock wasn't changed
        const book = await BookModel.findById(savedLowBook._id);
        expect(book.stock).toBe(1); // Still 1, not changed
    });
}); 