const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import your controllers (routers)
const UserController = require("./Controller/UserController");
const BookController = require("./Controller/BookController");
const CommentController = require("./Controller/CommentController");
const OrderController = require("./Controller/OrderController");
const RatingController = require("./Controller/RatingController");

// Import the simplified email service
const { sendSimpleOrderEmail } = require('./utils/simplifiedEmailService');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your_jwt_secret_key'; // Consider storing this in an environment variable

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/MyLocalBookstore", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB connection successful"))
    .catch(err => console.error("MongoDB connection error:", err));

// AFTER the .then/.catch above:
mongoose.connection.once('open', async () => {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  // For BookModel (defaults to "books" collection)
  if (!collectionNames.includes('books')) {
    await db.createCollection('books');
    console.log('Created "books" collection.');
  }

  // For UserModel (named "users")
  if (!collectionNames.includes('users')) {
    await db.createCollection('users');
    console.log('Created "users" collection.');
  }

  // If you add a separate "comments" collection later
  if (!collectionNames.includes('comments')) {
    await db.createCollection('comments');
    console.log('Created "comments" collection.');
  }

  // If you add a separate "ratings" collection later
  if (!collectionNames.includes('ratings')) {
    await db.createCollection('ratings');
    console.log('Created "ratings" collection.');
  }

  // For OrderModel (named "orders")
  if (!collectionNames.includes('orders')) {
    await db.createCollection('orders');
    console.log('Created "orders" collection.');
  }

  console.log('All necessary collections checked and created if missing.');
});

// Mount controllers
// Make sure your frontend requests match these paths (e.g., "/api/users/login")
app.use("/api/users", UserController);
app.use("/api/books", BookController);
app.use("/api/comments", CommentController);
app.use("/api/orders", OrderController);
app.use("/api/ratings", RatingController);

// Simple test route for emails
app.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    // Create a test order
    const testOrder = {
      _id: "TEST-" + Date.now(),
      items: [
        { title: "Test Book", quantity: 1, price: 19.99 }
      ],
      total: 19.99,
      status: 'processing'
    };
    
    const result = await sendSimpleOrderEmail(testOrder, email);
    
    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in test email route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
