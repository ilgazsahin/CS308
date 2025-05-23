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

/**
 * Sends a refund approval email to the customer
 * @param {Object} orderData - The order details with refund information
 * @param {string} recipientEmail - Customer's email address
 * @returns {Promise} - Email sending result
 */
const sendRefundApprovalEmail = async (orderData, recipientEmail) => {
  try {
    // Format order items for email
    const itemsList = orderData.items.map(item => 
      `<li>${item.title} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}</li>`
    ).join('');

    // Get refund details
    const refundAmount = orderData.refundRequest && orderData.refundRequest.refundAmount 
      ? orderData.refundRequest.refundAmount 
      : orderData.total;
    
    const refundDate = orderData.refundRequest && orderData.refundRequest.processedAt 
      ? new Date(orderData.refundRequest.processedAt) 
      : new Date();

    const mailOptions = {
      from: 'store26order@gmail.com',
      to: recipientEmail,
      subject: `Refund Approved for Order #${orderData._id || orderData.orderId} - CS308 Project`,
      html: `
        <h2>Your Refund Has Been Approved!</h2>
        <p>Good news! We've approved your refund request for Order #${orderData._id || orderData.orderId}.</p>
        <p>Refund Processed On: ${refundDate.toLocaleString()}</p>
        
        <h3>Refund Details:</h3>
        <p><strong>Refunded Amount: $${refundAmount.toFixed(2)}</strong></p>
        
        <h3>Order Items Returned:</h3>
        <ul>
          ${itemsList}
        </ul>
        
        <p>The refunded amount will be credited back to your original payment method. 
        Please allow 5-10 business days for the refund to appear on your account statement.</p>
        
        <hr>
        <p>We value your business and hope to serve you again soon!</p>
        <p>This is an automated email from CS308 Project. Please do not reply to this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Refund approval email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending refund approval email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendRefundApprovalEmail
}; 