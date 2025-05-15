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
 * Sends a refund request notification email to the customer
 * @param {Object} refundData - Refund request details
 * @param {string} recipientEmail - Customer's email address
 * @returns {Promise<Object>} - Result of email operation
 */
const sendRefundNotification = async (refundData, recipientEmail) => {
  try {
    const mailOptions = {
      from: 'store26order@gmail.com',
      to: recipientEmail,
      subject: `Refund Request Received - Order #${refundData.orderId}`,
      html: `
        <h2>Your Refund Request Has Been Received</h2>
        <p><strong>Order ID:</strong> ${refundData.orderId}</p>
        <p><strong>Reason:</strong> ${refundData.reason || 'Not specified'}</p>
        <p><strong>Status:</strong> ${refundData.status}</p>
        <p>We will review your request and notify you once it's processed.</p>
        <hr>
        <p>This is an automated message from CS308 Project. Please do not reply directly to this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Refund email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending refund email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRefundNotification
};
