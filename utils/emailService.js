const nodemailer = require('nodemailer');
const { generateInvoicePDF } = require('./pdfGenerator');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'store26order@gmail.com',
    pass: 'eaic gidj ilup hori' // App password, not regular password
  }
});

/**
 * Sends an order confirmation email to the customer
 * @param {Object} orderData - The order details
 * @param {string} recipientEmail - Customer's email address
 * @returns {Promise} - Email sending result
 */
const sendOrderConfirmation = async (orderData, recipientEmail) => {
  try {
    // Format order items for email
    const itemsList = orderData.items.map(item => 
      `<li>${item.title} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}</li>`
    ).join('');

    // Get order date - handle both formats
    const orderDate = orderData.createdAt || orderData.orderDate || new Date();
    
    // Get total from either totalAmount or total
    const totalAmount = orderData.totalAmount || orderData.total || 0;
    
    // Get customer address
    const address = orderData.shippingAddress || 
      (orderData.shippingInfo ? 
        `${orderData.shippingInfo.address}, ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} ${orderData.shippingInfo.zip}, ${orderData.shippingInfo.country}` : 
        'Not provided');

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(orderData);
    
    // Generate an invoice filename
    const invoiceFilename = `Invoice-${orderData._id || orderData.orderId}.pdf`;

    const mailOptions = {
      from: 'store26order@gmail.com',
      to: recipientEmail,
      subject: `Order Confirmation #${orderData._id || orderData.orderId} - CS308 Project`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order #: ${orderData._id || orderData.orderId}</p>
        <p>Date: ${new Date(orderDate).toLocaleString()}</p>
        <h3>Order Details:</h3>
        <ul>
          ${itemsList}
        </ul>
        <p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>
        <p>Shipping Address: ${address}</p>
        <p>Status: ${orderData.status}</p>
        <p>We've attached your invoice as a PDF to this email.</p>
        <hr>
        <p>This is an automated email from CS308 Project. Please do not reply to this email.</p>
      `,
      attachments: [
        {
          filename: invoiceFilename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully with invoice attachment:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation
}; 