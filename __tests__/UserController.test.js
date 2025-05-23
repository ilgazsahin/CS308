const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/UserModel');
const userRouter = require('../Controller/UserController');

let app;
let mongoServer;
let testUserId;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/users', userRouter);

    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const testUser = new UserModel({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        userType: 'customer',
        address: '123 Test St'
    });
    const savedUser = await testUser.save();
    testUserId = savedUser._id.toString();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('UserController API', () => {
    test('POST /api/users/register should create a new user', async () => {
        const newUser = {
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123',
            userType: 'customer',
            address: '456 New St'
        };

        const response = await request(app)
            .post('/api/users/register')
            .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User successfully created');
        expect(response.body.user.email).toBe(newUser.email);
        expect(response.body.user.name).toBe(newUser.name);
        expect(response.body.user.userType).toBe(newUser.userType);
        expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('POST /api/users/register should reject duplicate email', async () => {
        const duplicateUser = {
            name: 'Duplicate User',
            email: 'test@example.com', // Same as existing user
            password: 'password123'
        };

        const response = await request(app)
            .post('/api/users/register')
            .send(duplicateUser);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('This email is already registered');
    });

    test('POST /api/users/login should authenticate user with correct credentials', async () => {
        const credentials = {
            email: 'test@example.com',
            password: 'testpassword'
        };

        const response = await request(app)
            .post('/api/users/login')
            .send(credentials);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(credentials.email);
        expect(response.body.user.id).toBe(testUserId);
    });

    test('POST /api/users/login should reject invalid credentials', async () => {
        const invalidCredentials = {
            email: 'test@example.com',
            password: 'wrongpassword'
        };

        const response = await request(app)
            .post('/api/users/login')
            .send(invalidCredentials);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid credentials');
    });

    test('GET /api/users/check-role/:userId should verify user role correctly', async () => {
        const response = await request(app)
            .get(`/api/users/check-role/${testUserId}?role=customer`);

        expect(response.status).toBe(200);
        expect(response.body.hasRole).toBe(true);
        expect(response.body.userType).toBe('customer');
        expect(response.body.requestedRole).toBe('customer');
    });
}); 