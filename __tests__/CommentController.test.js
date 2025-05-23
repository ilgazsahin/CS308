const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CommentModel = require('../Models/CommentModel');
const OrderModel = require('../Models/OrderModel');
const BookModel = require('../Models/BookModel');
const UserModel = require('../Models/UserModel');
const commentRouter = require('../Controller/CommentController');

let app;
let mongoServer;
let testBookId;
let testUserId;
let testOrderId;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/comments', commentRouter);

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

    // Create a delivered order
    const testOrder = new OrderModel({
        orderId: 12345,
        orderNumber: 1001,
        userId: testUserId,
        items: [{ _id: testBookId, title: 'Test Book', author: 'Test Author', price: 19.99, quantity: 1 }],
        total: 19.99,
        status: 'delivered',
        orderDate: new Date()
    });
    const savedOrder = await testOrder.save();
    testOrderId = savedOrder.orderId;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('CommentController API', () => {
    test('POST /api/comments/:bookId should create a new comment for delivered order', async () => {
        const commentData = {
            userId: testUserId,
            text: 'Great book! Really enjoyed reading it.',
            orderId: testOrderId
        };

        const response = await request(app)
            .post(`/api/comments/${testBookId}`)
            .send(commentData);

        expect(response.status).toBe(201);
        expect(response.body.text).toBe(commentData.text);
        expect(response.body.user._id).toBe(testUserId);
        expect(response.body.status).toBe(false); // Comments start as unapproved
    });

    test('POST /api/comments/:bookId should reject comment for non-delivered order', async () => {
        // Create a processing order
        const processingOrder = new OrderModel({
            orderId: 12346,
            orderNumber: 1002,
            userId: testUserId,
            items: [{ _id: testBookId, title: 'Test Book', author: 'Test Author', price: 19.99, quantity: 1 }],
            total: 19.99,
            status: 'processing',
            orderDate: new Date()
        });
        await processingOrder.save();

        const commentData = {
            userId: testUserId,
            text: 'Trying to comment on processing order',
            orderId: 12346
        };

        const response = await request(app)
            .post(`/api/comments/${testBookId}`)
            .send(commentData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('You can only review items from delivered orders');
    });

    test('GET /api/comments/:bookId should return approved comments and ratings', async () => {
        // Create an approved comment
        const approvedComment = new CommentModel({
            book: testBookId,
            user: testUserId,
            text: 'Approved comment text',
            orderId: testOrderId,
            status: true
        });
        await approvedComment.save();

        const response = await request(app)
            .get(`/api/comments/${testBookId}`);

        expect(response.status).toBe(200);
        expect(response.body.reviews).toBeDefined();
        expect(response.body.averageRating).toBeDefined();
        expect(response.body.totalRatings).toBeDefined();
        expect(Array.isArray(response.body.reviews)).toBe(true);
    });

    test('PATCH /api/comments/:commentId/status should update comment approval status', async () => {
        // Create a comment to update
        const comment = new CommentModel({
            book: testBookId,
            user: testUserId,
            text: 'Comment to approve',
            orderId: testOrderId,
            status: false
        });
        const savedComment = await comment.save();

        const response = await request(app)
            .patch(`/api/comments/${savedComment._id}/status`)
            .send({ status: true });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);

        // Verify in database
        const updatedComment = await CommentModel.findById(savedComment._id);
        expect(updatedComment.status).toBe(true);
    });
}); 