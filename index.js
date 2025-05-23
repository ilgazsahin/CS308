// index.js
require('dotenv').config();               // ← load .env first

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

// Import your controllers (routers)
const UserController = require("./Controller/UserController");
const BookController = require("./Controller/BookController");
const CommentController = require("./Controller/CommentController");
const OrderController = require("./Controller/OrderController");
const RatingController = require("./Controller/RatingController");
const CartController = require("./Controller/CartController");
const WishlistController = require("./Controller/WishListController");
const CategoryController = require("./Controller/CategoryController");

// Import the simplified email service
const { sendSimpleOrderEmail } = require('./utils/simplifiedEmailService');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;   // now read from .env

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(cors());

/* ---------- MongoDB Connection ---------- */
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('🗄️  MongoDB connection successful'))
  .catch(err => console.error(' MongoDB connection error:', err));

/* ---------- Ensure Collections Exist ---------- */
mongoose.connection.once('open', async () => {
  const db         = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names       = collections.map(c => c.name);

  const needed = ['books', 'users', 'comments', 'ratings', 'orders', 'carts', 'categories'];
  for (const name of needed) {
    if (!names.includes(name)) {
      await db.createCollection(name);
      console.log(`🆕 Created "${name}" collection`);
    }
  }
  console.log('✔️  All necessary collections checked/created');
});

// Mount controllers
// Make sure your frontend requests match these paths (e.g., "/api/users/login")
app.use("/api/users", UserController);
app.use("/api/books", BookController);
app.use("/api/comments", CommentController);
app.use("/api/orders", OrderController);
app.use("/api/ratings", RatingController);
app.use("/api/carts", CartController);
app.use('/api/wishlist', WishlistController);
app.use('/api/categories', CategoryController);

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

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
