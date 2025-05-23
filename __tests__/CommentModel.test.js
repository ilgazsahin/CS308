const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CommentModel = require('../Models/CommentModel');
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
    testUserId = savedUser._id;

    const testBook = new BookModel({
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        price: 19.99,
        stock: 10,
        category: 'Fiction'
    });
    const savedBook = await testBook.save();
    testBookId = savedBook._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clean up comments after each test
    await CommentModel.deleteMany({});
});

describe('CommentModel', () => {
    test('should create & save a comment successfully', async () => {
        const commentData = {
            book: testBookId,
            user: testUserId,
            text: 'This is a great book! Really enjoyed it.',
            orderId: 12345,
            status: false
        };

        const comment = new CommentModel(commentData);
        const savedComment = await comment.save();

        expect(savedComment._id).toBeDefined();
        expect(savedComment.book.toString()).toBe(testBookId.toString());
        expect(savedComment.user.toString()).toBe(testUserId.toString());
        expect(savedComment.text).toBe(commentData.text);
        expect(savedComment.orderId).toBe(commentData.orderId);
        expect(savedComment.status).toBe(false);
        expect(savedComment.createdAt).toBeDefined();
    });

    test('should not save comment without required fields', async () => {
        const incompleteComment = new CommentModel({
            text: 'Comment without required fields'
            // Missing book, user, orderId
        });

        let err;
        try {
            await incompleteComment.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.book).toBeDefined();
        expect(err.errors.user).toBeDefined();
        expect(err.errors.orderId).toBeDefined();
    });

    test('should default status to false when not provided', async () => {
        const commentData = {
            book: testBookId,
            user: testUserId,
            text: 'Comment without explicit status',
            orderId: 12346
        };

        const comment = new CommentModel(commentData);
        const savedComment = await comment.save();

        expect(savedComment.status).toBe(false);
    });

    test('should populate book and user references correctly', async () => {
        const commentData = {
            book: testBookId,
            user: testUserId,
            text: 'Comment for population test',
            orderId: 12347,
            status: true
        };

        const comment = await CommentModel.create(commentData);
        const populatedComment = await CommentModel.findById(comment._id)
            .populate('book', 'title author')
            .populate('user', 'name email');

        expect(populatedComment.book.title).toBe('Test Book');
        expect(populatedComment.book.author).toBe('Test Author');
        expect(populatedComment.user.name).toBe('Test User');
        expect(populatedComment.user.email).toBe('test@example.com');
    });

    test('should find comments by book ID', async () => {
        // Create multiple comments for the same book
        const comments = [
            {
                book: testBookId,
                user: testUserId,
                text: 'First comment',
                orderId: 12348,
                status: true
            },
            {
                book: testBookId,
                user: testUserId,
                text: 'Second comment',
                orderId: 12349,
                status: false
            }
        ];

        await CommentModel.create(comments);

        const bookComments = await CommentModel.find({ book: testBookId });
        expect(bookComments.length).toBe(2);

        const approvedComments = await CommentModel.find({ 
            book: testBookId, 
            status: true 
        });
        expect(approvedComments.length).toBe(1);
        expect(approvedComments[0].text).toBe('First comment');
    });
}); 