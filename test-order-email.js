const { sendOrderConfirmation } = require('./utils/emailService');

async function testOrderEmail() {
  try {
    const email = process.argv[2] || 'store26order@gmail.com';
    console.log(`Testing order email to: ${email}`);

    // Create a sample order for testing
    const testOrder = {
      _id: "TEST-ORDER-" + Date.now(),
      orderId: Date.now(),
      createdAt: new Date(),
      items: [
        { 
          _id: "book1", 
          title: "The Great Gatsby", 
          author: "F. Scott Fitzgerald",
          quantity: 2, 
          price: 19.99,
          image: "https://example.com/book1.jpg"
        },
        { 
          _id: "book2", 
          title: "To Kill a Mockingbird", 
          author: "Harper Lee",
          quantity: 1, 
          price: 14.99,
          image: "https://example.com/book2.jpg"
        }
      ],
      totalAmount: 54.97,
      total: 54.97,
      shippingInfo: {
        name: "John Doe",
        email: email,
        address: "123 Test Street",
        city: "Test City",
        state: "TS",
        zip: "12345",
        country: "Turkey",
        phone: "555-123-4567"
      },
      status: "processing",
      userId: "user123"
    };
    
    console.log('Sending order confirmation email...');
    const result = await sendOrderConfirmation(testOrder, email);
    
    if (result.success) {
      console.log('✅ Order email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send order email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error in test script:', error);
  }
}

if (process.argv.length < 3) {
  console.log('Usage: node test-order-email.js your-email@example.com');
  console.log('No email provided - sending test to self');
}

testOrderEmail(); 