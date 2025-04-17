const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for PDF files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create the multer upload instance
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
}).single('pdf');

// Create a test email account using Ethereal for development
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.error('Failed to create test email account:', error);
    throw error;
  }
};

// Configure email transporter (in production, you would use your actual SMTP settings)
const getTransporter = async () => {
  // For development, use Ethereal email
  if (process.env.NODE_ENV !== 'production') {
    return await createTestAccount();
  }
  
  // For production, configure with actual email settings
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASS || 'password'
    }
  });
};

const sendInvoiceEmail = async (req, res) => {
  // Handle the file upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'Error uploading file' 
      });
    }

    const { email, orderId } = req.body;

    if (!req.file || !email || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: PDF file, email or orderId' 
      });
    }

    try {
      // Get email transporter
      const transporter = await getTransporter();
      
      // Send the email with the attached PDF
      const info = await transporter.sendMail({
        from: '"STORE 26" <noreply@store26.com>',
        to: email,
        subject: `Your Invoice #${orderId} from STORE 26`,
        text: `Thank you for shopping with STORE 26! Please find your invoice #${orderId} attached to this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Your STORE 26 Invoice</h2>
            <p>Dear Customer,</p>
            <p>Thank you for shopping with STORE 26! Your order has been confirmed.</p>
            <p>Please find your invoice attached to this email for your reference.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f8f8f8; border-radius: 5px;">
              <p style="margin: 0;"><strong>Order Number:</strong> ${orderId}</p>
            </div>
            <p>If you have any questions about your order, please contact our customer service at support@store26.com</p>
            <p style="margin-top: 30px;">Best regards,</p>
            <p>The STORE 26 Team</p>
          </div>
        `,
        attachments: [
          {
            filename: `STORE26_Invoice_${orderId}.pdf`,
            path: req.file.path,
            contentType: 'application/pdf'
          }
        ]
      });

      // For development, log the test URL where you can preview the email
      if (process.env.NODE_ENV !== 'production') {
        console.log('Test email URL:', nodemailer.getTestMessageUrl(info));
      }

      // Clean up the uploaded file after sending
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });

      res.status(200).json({ 
        success: true, 
        message: 'Invoice email sent successfully',
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send email', 
        error: error.message 
      });
    }
  });
};

module.exports = {
  sendInvoiceEmail
}; 