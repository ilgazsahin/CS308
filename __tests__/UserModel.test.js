// __tests__/userModel.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UserModel = require('../Models/UserModel');

let mongoServer;

beforeAll(async () => {
    // start in-memory mongo
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // clean up users between tests
    await UserModel.deleteMany({});
});

describe('UserModel', () => {
    test('should create & retrieve a user with the correct fields', async () => {
        const payload = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'superSecret123'
        };

        // create + save
        const created = await UserModel.create(payload);

        // ensure an _id was assigned
        expect(created._id).toBeDefined();

        // check each property
        expect(created.name).toBe(payload.name);
        expect(created.email).toBe(payload.email);
        expect(created.password).toBe(payload.password);

        // fetch back from the DB
        const found = await UserModel.findOne({ email: payload.email });
        expect(found).not.toBeNull();
        expect(found.name).toBe(payload.name);
    });

    test('should cast non-string inputs to strings', () => {
        // Mongoose will cast 123 → "123" for a String field
        const user = new UserModel({ name: 123, email: 456, password: 789 });
        expect(user.name).toBe('123');
        expect(user.email).toBe('456');
        expect(user.password).toBe('789');
    });

    test('should handle user with all optional fields', async () => {
        const completeUserData = {
            name: 'Complete User',
            email: 'complete@example.com',
            password: 'securePassword123',
            userType: 'customer',
            address: '789 Complete Ave'
        };

        const user = await UserModel.create(completeUserData);
        
        expect(user._id).toBeDefined();
        expect(user.name).toBe(completeUserData.name);
        expect(user.email).toBe(completeUserData.email);
        expect(user.password).toBe(completeUserData.password);
        expect(user.userType).toBe(completeUserData.userType);
        expect(user.address).toBe(completeUserData.address);

        // Verify it can be retrieved from database
        const foundUser = await UserModel.findById(user._id);
        expect(foundUser).not.toBeNull();
        expect(foundUser.email).toBe(completeUserData.email);
        expect(foundUser.userType).toBe(completeUserData.userType);
    });
});
