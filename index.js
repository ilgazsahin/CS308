const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import your controllers (routers)
const UserController = require("./Controller/UserController");
const BookController = require("./Controller/BookController");
const CommentController = require("./Controller/CommentController");



const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your_jwt_secret_key'; // Consider storing this in an environment variable

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb+srv://ilgaz:CS308@cluster0.zy6wx.mongodb.net/MyLocalBookstore", {
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

  console.log('All necessary collections checked and created if missing.');
});

// Mount controllers
// Make sure your frontend requests match these paths (e.g., "/api/users/login")
app.use("/api/users", UserController);
app.use("/api/books", BookController);
app.use("/api/comments", CommentController);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
