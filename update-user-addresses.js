// update-user-addresses.js
require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./Models/UserModel');

async function updateUserAddresses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all users without an address or with an empty address
    const users = await UserModel.find({ 
      $or: [
        { address: { $exists: false } },
        { address: "" }
      ]
    });
    console.log(`Found ${users.length} users without an address`);

    // Default addresses for each user type
    const defaultAddresses = {
      'customer': 'Customer Default Address, Istanbul, Turkey',
      'product': 'Product Manager Office, Corporate HQ, Istanbul, Turkey',
      'sales': 'Sales Department, Corporate HQ, Istanbul, Turkey'
    };

    // Update users with default addresses based on their user type
    let updatedCount = 0;
    for (const user of users) {
      const defaultAddress = defaultAddresses[user.userType] || defaultAddresses.customer;
      
      user.address = defaultAddress;
      await user.save();
      updatedCount++;
      
      console.log(`Updated user ${user.name} (${user.email}) with address: ${defaultAddress}`);
    }

    console.log(`\nUpdated ${updatedCount} users with default addresses`);

    // Show all users with their addresses
    const allUsers = await UserModel.find({}, { name: 1, email: 1, userType: 1, address: 1 });
    console.log('\nAll users with addresses:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}, ${user.userType}): "${user.address}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

updateUserAddresses(); 