// update-user-types.js
require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./Models/UserModel');

async function updateUserTypes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all users without a userType field set
    const users = await UserModel.find({ userType: { $exists: false } });
    console.log(`Found ${users.length} users without a userType field`);

    // Update all users to have the "customer" type
    const result = await UserModel.updateMany(
      { userType: { $exists: false } }, 
      { $set: { userType: 'customer' } }
    );

    console.log(`Updated ${result.modifiedCount} users to have the "customer" userType`);

    // Create test admin users if needed
    const existingProductManager = await UserModel.findOne({ email: 'product@example.com' });
    if (!existingProductManager) {
      await UserModel.create({
        name: 'Product Manager',
        email: 'product@example.com',
        password: '$2a$10$ZYmMvg7t6rqHRQU5QS3QHuGaQuMOWqHZQX5Vu.YU/zBs7MWzJyGsG', // hash of 'password123'
        userType: 'product'
      });
      console.log('Created test product manager');
    }

    const existingSalesManager = await UserModel.findOne({ email: 'sales@example.com' });
    if (!existingSalesManager) {
      await UserModel.create({
        name: 'Sales Manager',
        email: 'sales@example.com',
        password: '$2a$10$ZYmMvg7t6rqHRQU5QS3QHuGaQuMOWqHZQX5Vu.YU/zBs7MWzJyGsG', // hash of 'password123'
        userType: 'sales'
      });
      console.log('Created test sales manager');
    }

    // Show all users with their types
    const allUsers = await UserModel.find({}, { name: 1, email: 1, userType: 1 });
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.userType}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

updateUserTypes(); 