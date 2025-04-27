const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'store26order@gmail.com',
    pass: 'eaic gidj ilup hori' // App password
  }
});

async function testEmail() {
  try {
    // Simple email without attachment
    const mailOptions = {
      from: 'store26order@gmail.com',
      to: process.argv[2] || 'store26order@gmail.com', // Send to self if no email provided
      subject: 'Test Email from BookStore',
      html: `
        <h2>This is a test email</h2>
        <p>If you're seeing this, the email service is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Check if email argument was provided
if (process.argv.length < 3) {
  console.log('Usage: node test-email.js recipient@example.com');
  console.log('No email provided - sending test to self');
}

testEmail(); 