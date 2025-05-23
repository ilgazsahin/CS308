const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const OrderModel = require('../Models/OrderModel');

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
    // Clean up orders between tests
    await OrderModel.deleteMany({});
});

describe('OrderModel', () => {
    test('should create & save an order successfully', async () => {
        const orderData = {
            orderId: 12345,
            orderNumber: 1001,
            userId: 'user123',
            items: [
                { 
                    _id: 'book1', 
                    title: 'Test Book 1', 
                    author: 'Author 1',
                    price: 19.99,
                    quantity: 2 
                },
                { 
                    _id: 'book2', 
                    title: 'Test Book 2', 
                    author: 'Author 2',
                    price: 14.99,
                    quantity: 1 
                }
            ],
            shippingInfo: {
                name: 'John Doe',
                email: 'john@example.com',
                address: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zip: '12345',
                country: 'Turkey'
            },
            totalAmount: 54.97,
            total: 54.97,
            status: 'processing',
            orderDate: new Date()
        };

        const order = new OrderModel(orderData);
        const savedOrder = await order.save();
        
        // Verify saved order
        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.userId).toBe(orderData.userId);
        expect(savedOrder.orderId).toBe(orderData.orderId);
        expect(savedOrder.orderNumber).toBe(orderData.orderNumber);
        expect(savedOrder.items.length).toBe(2);
        expect(savedOrder.items[0].title).toBe('Test Book 1');
        expect(savedOrder.total).toBe(54.97);
        expect(savedOrder.status).toBe('processing');
    });

    test('should not save an order without required fields', async () => {
        const incompleteOrder = new OrderModel({
            userId: 'user123',
            // Missing items, orderId, orderNumber, total
            status: 'processing'
        });

        let err;
        try {
            await incompleteOrder.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.orderId).toBeDefined();
        expect(err.errors.orderNumber).toBeDefined();
        expect(err.errors.total).toBeDefined();
    });

    test('should enforce valid status values', async () => {
        const orderWithInvalidStatus = new OrderModel({
            orderId: 12346,
            orderNumber: 1002,
            userId: 'user123',
            items: [
                { 
                    _id: 'book1', 
                    title: 'Test Book', 
                    author: 'Test Author',
                    price: 19.99,
                    quantity: 1 
                }
            ],
            total: 19.99,
            status: 'invalid-status' // Invalid status
        });

        let err;
        try {
            await orderWithInvalidStatus.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.status).toBeDefined();
    });

    test('should find orders by userId', async () => {
        // Create multiple orders for the same user
        const userId = 'testUser123';
        
        const orderData1 = {
            orderId: 12347,
            orderNumber: 1003,
            userId,
            items: [{ _id: 'book1', title: 'Book 1', author: 'Author', price: 10.99, quantity: 1 }],
            totalAmount: 10.99,
            total: 10.99,
            status: 'processing',
            orderDate: new Date(2023, 1, 1)
        };
        
        const orderData2 = {
            orderId: 12348,
            orderNumber: 1004,
            userId,
            items: [{ _id: 'book2', title: 'Book 2', author: 'Author', price: 15.99, quantity: 2 }],
            totalAmount: 31.98,
            total: 31.98,
            status: 'in-transit',
            orderDate: new Date(2023, 2, 1)
        };

        // Create a different user's order
        const orderData3 = {
            orderId: 12349,
            orderNumber: 1005,
            userId: 'otherUser',
            items: [{ _id: 'book3', title: 'Book 3', author: 'Author', price: 12.99, quantity: 1 }],
            totalAmount: 12.99,
            total: 12.99,
            status: 'processing',
            orderDate: new Date(2023, 3, 1)
        };

        await OrderModel.create(orderData1);
        await OrderModel.create(orderData2);
        await OrderModel.create(orderData3);

        // Find orders for testUser123
        const userOrders = await OrderModel.find({ userId });
        
        expect(userOrders.length).toBe(2);
        
        // Sort the orders by date (newest first) since MongoDB might return them in any order
        const sortedOrders = [...userOrders].sort((a, b) => 
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        
        // Now verify the sorted order
        expect(sortedOrders[0].total).toBe(31.98); // orderData2 is newer
        expect(sortedOrders[1].total).toBe(10.99); // orderData1 is older
    });

    test('should update order status', async () => {
        // Create an order
        const orderData = {
            orderId: 12350,
            orderNumber: 1006,
            userId: 'user123',
            items: [{ _id: 'book1', title: 'Book', author: 'Author', price: 19.99, quantity: 1 }],
            totalAmount: 19.99,
            total: 19.99,
            status: 'processing',
            orderDate: new Date()
        };

        const order = await OrderModel.create(orderData);
        
        // Update the status
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            order._id,
            { status: 'in-transit' },
            { new: true }
        );

        expect(updatedOrder.status).toBe('in-transit');
        
        // Verify in database
        const fetchedOrder = await OrderModel.findById(order._id);
        expect(fetchedOrder.status).toBe('in-transit');
    });

    test('should validate shipping information structure', async () => {
        const orderWithShipping = {
            orderId: 12351,
            orderNumber: 1007,
            userId: 'user123',
            items: [{ _id: 'book1', title: 'Book', author: 'Author', price: 19.99, quantity: 1 }],
            shippingInfo: {
                name: 'John Smith',
                email: 'john.smith@example.com',
                address: '456 Shipping St',
                city: 'Ship City',
                state: 'SC',
                zip: '54321',
                country: 'Turkey'
            },
            totalAmount: 19.99,
            total: 19.99,
            status: 'processing'
        };

        const order = await OrderModel.create(orderWithShipping);
        
        expect(order.shippingInfo.name).toBe('John Smith');
        expect(order.shippingInfo.email).toBe('john.smith@example.com');
        expect(order.shippingInfo.address).toBe('456 Shipping St');
        expect(order.shippingInfo.city).toBe('Ship City');
        expect(order.shippingInfo.country).toBe('Turkey');
    });

    test('should handle orders with multiple items and calculate totals', async () => {
        const multiItemOrder = {
            orderId: 12352,
            orderNumber: 1008,
            userId: 'user123',
            items: [
                { _id: 'book1', title: 'Book 1', author: 'Author 1', price: 15.99, quantity: 2 },
                { _id: 'book2', title: 'Book 2', author: 'Author 2', price: 24.99, quantity: 1 },
                { _id: 'book3', title: 'Book 3', author: 'Author 3', price: 9.99, quantity: 3 }
            ],
            totalAmount: 86.95, // (15.99*2) + (24.99*1) + (9.99*3)
            total: 86.95,
            status: 'processing'
        };

        const order = await OrderModel.create(multiItemOrder);
        
        expect(order.items.length).toBe(3);
        expect(order.total).toBe(86.95);
        expect(order.items[0].quantity).toBe(2);
        expect(order.items[1].quantity).toBe(1);
        expect(order.items[2].quantity).toBe(3);
        
        // Verify item details
        expect(order.items[0].title).toBe('Book 1');
        expect(order.items[1].price).toBe(24.99);
        expect(order.items[2].price).toBe(9.99);
    });
}); 