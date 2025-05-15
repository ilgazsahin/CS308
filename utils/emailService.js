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

const sendRefundNotification = async (refundData, recipientEmail, recipientName) => {
  const { refundedAmount, status } = refundData;

  const mailOptions = {
    from: '"Store 26" <store26.noreply@gmail.com>',
    to: recipientEmail,
    subject: "Refund Status Update",
    html: `
      <h3>Hello ${recipientName},</h3>
      <p>Your refund request has been <strong>${status}</strong>.</p>
      ${
        status === "approved"
          ? `<p>The refunded amount is: <strong>$${refundedAmount.toFixed(2)}</strong></p>`
          : ""
      }
      <p>Thank you for shopping with us.</p>
      <hr />
      <p style="font-size: 0.9em; color: #888;">This is an automated message. Please do not reply.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Refund email sent to ${recipientEmail}`);
  } catch (err) {
    console.error("Failed to send refund email:", err);
  }
};
const sendDiscountNotification = async ({ to, name, title, newPrice }) => {
  try {
    await transporter.sendMail({
      from: 'store26order@gmail.com',
      to,
      subject: 'Great News! A Book in Your Wishlist is Now Discounted!',
      html: `
        <p>Dear ${name},</p>
        <p>We're excited to inform you that a book in your wishlist is now discounted!</p>
        <p><strong>${title}</strong> is now only <strong>$${newPrice.toFixed(2)}</strong>.</p>
        <p><a href="http://localhost:3000/book">Check it out now!</a></p>
        <p>Happy reading!</p>
        <hr>
        <p>This is an automated message from Store26.</p>
      `
    });
    console.log(`Discount notification sent to ${to}`);
  } catch (err) {
    console.error("Error sending discount email:", err);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendDiscountNotification,
  sendRefundNotification
}; 