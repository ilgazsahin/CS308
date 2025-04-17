// Load environment variables from .env file
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import your controllers (routers)
const UserController = require("./Controller/UserController");
const BookController = require("./Controller/BookController");
const CommentController = require("./Controller/CommentController");
const EmailController = require("./Controller/EmailController");
const OrderController = require("./Controller/OrderController");
const CartController = require("./Controller/CartController");
const InvoiceController = require("./Controller/InvoiceController");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Consider storing this in an environment variable

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
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Helper function to create collection if it doesn't exist
    const createCollectionIfNotExists = async (collectionName) => {
      try {
        if (!collectionNames.includes(collectionName)) {
          await db.createCollection(collectionName);
          console.log(`Created "${collectionName}" collection.`);
        } else {
          console.log(`"${collectionName}" collection already exists.`);
        }
      } catch (error) {
        // If error is NamespaceExists (code 48), the collection already exists
        if (error.code === 48) {
          console.log(`"${collectionName}" collection already exists.`);
        } else {
          console.error(`Error creating "${collectionName}" collection:`, error);
        }
      }
    };

    // Create collections if they don't exist
    await createCollectionIfNotExists('books');
    await createCollectionIfNotExists('users');
    await createCollectionIfNotExists('comments'); 
    await createCollectionIfNotExists('orders');
    await createCollectionIfNotExists('carts');
    await createCollectionIfNotExists('invoices');

    console.log('All necessary collections checked and created if missing.');
  } catch (error) {
    console.error('Error checking/creating collections:', error);
  }
});

// Mount controllers
// Make sure your frontend requests match these paths (e.g., "/api/users/login")
app.use("/api/users", UserController);
app.use("/api/books", BookController);
app.use("/api/comments", CommentController);
app.use("/api/orders", OrderController);
app.use("/api/carts", CartController);
app.use("/api/invoices", InvoiceController);

// Add email routes
app.post("/api/send-invoice-email", EmailController.sendInvoiceEmail);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
