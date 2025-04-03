// index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const BookRoutes = require('./Controller/BookController');
const UserRoutes = require('./Controller/UserController');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/books', BookRoutes);
app.use('/api/users', UserRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
