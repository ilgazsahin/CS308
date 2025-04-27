const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'store26order@gmail.com',
    pass: 'eaic gidj ilup hori' // App password
  }
});

/**
 * Sends a simple order confirmation email - no PDF attachment
 * @param {Object} orderData - Order details 
 * @param {string} recipientEmail - Recipient email address
 * @returns {Promise<Object>} Email sending result
 */
const sendSimpleOrderEmail = async (orderData, recipientEmail) => {
  try {
    console.log(`Sending simple order email to: ${recipientEmail}`);
    console.log(`Order data:`, JSON.stringify(orderData, null, 2));
    
    // Create items list for email
    const itemsList = orderData.items && orderData.items.length > 0 
      ? orderData.items.map(item => {
          return `<li>${item.title || 'Unknown book'} - Qty: ${item.quantity} - $${(item.price || 0).toFixed(2)}</li>`;
        }).join('')
      : '<li>No items in order</li>';
    
    // Create email
    const mailOptions = {
      from: 'store26order@gmail.com',
      to: recipientEmail,
      subject: `Order Confirmation: ${orderData._id || orderData.orderId || 'New Order'}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order ID: ${orderData._id || orderData.orderId || 'N/A'}</p>
        <p>Order Date: ${new Date().toLocaleString()}</p>
        <h3>Order Items:</h3>
        <ul>${itemsList}</ul>
        <p><strong>Total: $${(orderData.total || orderData.totalAmount || 0).toFixed(2)}</strong></p>
        <p>Status: ${orderData.status || 'Processing'}</p>
        <hr>
        <p>This is a test email from CS308 Project</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending simple email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSimpleOrderEmail
}; 