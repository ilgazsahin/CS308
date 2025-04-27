// __tests__/cartController.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CartModel = require('../Models/CartModel');
const cartRouter = require('../Controller/CartController');

let app;
let mongoServer;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Setup Express app with JSON and cart routes
    app = express();
    app.use(express.json());
    app.use('/cart', cartRouter);
});

afterEach(async () => {
    // Clean up cart collection after each test
    await CartModel.deleteMany({});
});

afterAll(async () => {
    // Tear down
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('CartController', () => {
    test('GET /cart/:userId returns empty array if no cart exists', async () => {
        const res = await request(app).get('/cart/user123');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('POST /cart/:userId creates new cart and returns items', async () => {
        const items = [
            { _id: '1', title: 'Book', author: 'Author', price: 9.99, image: 'img.png', quantity: 2 }
        ];

        const res = await request(app)
            .post('/cart/user123')
            .send({ items });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(items);

        const cartInDb = await CartModel.findOne({ userId: 'user123' });
        expect(cartInDb).not.toBeNull();
        expect(cartInDb.items).toHaveLength(1);
        expect(cartInDb.items[0].title).toBe('Book');
    });

    test('POST /cart/:userId updates existing cart', async () => {
        // Create initial cart
        await new CartModel({ userId: 'user123', items: [
                { _id: '1', title: 'A', author: 'A', price: 1, image: '', quantity: 1 }
            ] }).save();

        const newItems = [
            { _id: '2', title: 'B', author: 'B', price: 2, image: '', quantity: 3 }
        ];

        const res = await request(app)
            .post('/cart/user123')
            .send({ items: newItems });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(newItems);

        const cartInDb = await CartModel.findOne({ userId: 'user123' });
        expect(cartInDb.items).toHaveLength(1);
        expect(cartInDb.items[0]._id).toBe('2');
    });

    test('DELETE /cart/:userId deletes the cart', async () => {
        // Create a cart to delete
        await new CartModel({ userId: 'user123', items: [
                { _id: '1', title: 'A', author: 'A', price: 1, image: '', quantity: 1 }
            ] }).save();

        const res = await request(app).delete('/cart/user123');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Cart deleted successfully' });

        const cartInDb = await CartModel.findOne({ userId: 'user123' });
        expect(cartInDb).toBeNull();
    });
});
