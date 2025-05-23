const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const WishListModel = require('../Models/WishListModel');
const BookModel = require('../Models/BookModel');
const UserModel = require('../Models/UserModel');
const wishListRouter = require('../Controller/WishListController');

let app;
let mongoServer;
let testBookId;
let testUserId;
let testWishListItemId;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/wishlist', wishListRouter);

    // Create test data
    const testUser = new UserModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
    });
    const savedUser = await testUser.save();
    testUserId = savedUser._id.toString();

    const testBook = new BookModel({
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
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

afterEach(async () => {
    // Clean up wishlist after each test
    await WishListModel.deleteMany({});
});

describe('WishListController API', () => {
    test('POST /api/wishlist should add a book to wishlist', async () => {
        const wishlistData = {
            userId: testUserId,
            bookId: testBookId
        };

        const response = await request(app)
            .post('/api/wishlist')
            .send(wishlistData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Added to wishlist');
        expect(response.body.item.userId).toBe(testUserId);
        expect(response.body.item.bookId).toBe(testBookId);

        // Verify item is in database
        const wishlistItem = await WishListModel.findOne({ userId: testUserId, bookId: testBookId });
        expect(wishlistItem).not.toBeNull();
    });

    test('POST /api/wishlist should handle duplicate items gracefully', async () => {
        // First, add an item
        await WishListModel.create({ userId: testUserId, bookId: testBookId });

        const wishlistData = {
            userId: testUserId,
            bookId: testBookId
        };

        const response = await request(app)
            .post('/api/wishlist')
            .send(wishlistData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Already in wishlist');
    });

    test('GET /api/wishlist/:userId should return user wishlist', async () => {
        // Create test wishlist items
        await WishListModel.create({ userId: testUserId, bookId: testBookId });

        const response = await request(app)
            .get(`/api/wishlist/${testUserId}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].userId).toBe(testUserId);
        expect(response.body[0].bookId._id).toBe(testBookId);
    });

    test('DELETE /api/wishlist/user/:userId/book/:bookId should remove specific item', async () => {
        // Create test wishlist item
        await WishListModel.create({ userId: testUserId, bookId: testBookId });

        const response = await request(app)
            .delete(`/api/wishlist/user/${testUserId}/book/${testBookId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Removed from wishlist');

        // Verify item is removed from database
        const wishlistItem = await WishListModel.findOne({ userId: testUserId, bookId: testBookId });
        expect(wishlistItem).toBeNull();
    });
}); 