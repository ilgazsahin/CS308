// index.js
require('dotenv').config();               // ← load .env first

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

// Routers
const UserController    = require('./Controller/UserController');
const BookController    = require('./Controller/BookController');
const CommentController = require('./Controller/CommentController');
const OrderController   = require('./Controller/OrderController');
const RatingController  = require('./Controller/RatingController');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;   // now read from .env

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(cors());

/* ---------- MongoDB Connection ---------- */
mongoose.connect(process.env.MONGODB_URI, {
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

  const needed = ['books', 'users', 'comments', 'ratings', 'orders'];
  for (const name of needed) {
    if (!names.includes(name)) {
      await db.createCollection(name);
      console.log(`🆕 Created "${name}" collection`);
    }
  }
  console.log('✔️  All necessary collections checked/created');
});

/* ---------- Routes ---------- */
app.use('/api/users',    UserController);
app.use('/api/books',    BookController);
app.use('/api/comments', CommentController);
app.use('/api/orders',   OrderController);
app.use('/api/ratings',  RatingController);

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
