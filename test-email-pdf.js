const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'store26order@gmail.com',
    pass: 'eaic gidj ilup hori' // App password
  }
});

async function generateSimplePDF() {
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Simple HTML content
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Test PDF</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: navy; }
      </style>
    </head>
    <body>
      <h1>Test PDF Document</h1>
      <p>This is a simple test PDF generated with Puppeteer.</p>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `);
  
  // Generate PDF buffer
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true
  });
  
  await browser.close();
  return pdfBuffer;
}

async function testEmailWithPDF() {
  try {
    console.log('Generating PDF...');
    const pdfBuffer = await generateSimplePDF();
    console.log('PDF generated successfully');
    
    const recipientEmail = process.argv[2] || 'store26order@gmail.com';
    
    // Email with PDF attachment
    const mailOptions = {
      from: 'store26order@gmail.com',
      to: recipientEmail,
      subject: 'Test Email with PDF Attachment',
      html: `
        <h2>This is a test email with PDF attachment</h2>
        <p>If you're seeing this with the PDF attachment, everything is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      attachments: [
        {
          filename: 'test-document.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('Sending email to', recipientEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Check if email argument was provided
if (process.argv.length < 3) {
  console.log('Usage: node test-email-pdf.js recipient@example.com');
  console.log('No email provided - sending test to self');
}

testEmailWithPDF(); 