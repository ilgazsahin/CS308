const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const WishListModel = require('../Models/WishListModel');
const BookModel = require('../Models/BookModel');
const UserModel = require('../Models/UserModel');

let mongoServer;
let testBookId;
let testUserId;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create test dependencies
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

describe('WishListModel', () => {
    test('should create & save a wishlist item successfully', async () => {
        const wishlistData = {
            userId: testUserId,
            bookId: testBookId
        };

        const wishlistItem = new WishListModel(wishlistData);
        const savedItem = await wishlistItem.save();

        expect(savedItem._id).toBeDefined();
        expect(savedItem.userId).toBe(testUserId);
        expect(savedItem.bookId.toString()).toBe(testBookId);
        expect(savedItem.createdAt).toBeDefined();
    });

    test('should not save wishlist item without required fields', async () => {
        const incompleteWishlistItem = new WishListModel({
            userId: testUserId
            // Missing bookId
        });

        let err;
        try {
            await incompleteWishlistItem.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.bookId).toBeDefined();
    });

    test('should populate book reference correctly', async () => {
        const wishlistData = {
            userId: testUserId,
            bookId: testBookId
        };

        const wishlistItem = await WishListModel.create(wishlistData);
        const populatedItem = await WishListModel.findById(wishlistItem._id)
            .populate('bookId', 'title author price');

        expect(populatedItem.bookId.title).toBe('Test Book');
        expect(populatedItem.bookId.author).toBe('Test Author');
        expect(populatedItem.bookId.price).toBe(19.99);
    });

    test('should find wishlist items by userId', async () => {
        // Create multiple wishlist items for the same user
        const book2 = new BookModel({
            title: 'Second Book',
            author: 'Second Author',
            description: 'Second Description',
            price: 15.99,
            stock: 5,
            category: 'Mystery'
        });
        const savedBook2 = await book2.save();

        await WishListModel.create([
            { userId: testUserId, bookId: testBookId },
            { userId: testUserId, bookId: savedBook2._id }
        ]);

        const userWishlist = await WishListModel.find({ userId: testUserId });
        expect(userWishlist.length).toBe(2);
        expect(userWishlist[0].userId).toBe(testUserId);
        expect(userWishlist[1].userId).toBe(testUserId);
    });

    test('should handle unique constraints for userId-bookId combination', async () => {
        // Create first wishlist item
        await WishListModel.create({
            userId: testUserId,
            bookId: testBookId
        });

        // Try to create duplicate
        const duplicateItem = new WishListModel({
            userId: testUserId,
            bookId: testBookId
        });

        let err;
        try {
            await duplicateItem.save();
        } catch (error) {
            err = error;
        }

        // Should handle duplicates gracefully (either via unique index or application logic)
        // Note: This depends on whether your schema has unique constraints
        expect(err).toBeDefined();
    });
}); 