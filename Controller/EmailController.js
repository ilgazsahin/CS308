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

// Mailgun configuration constants - only from environment variables 
const MAILGUN_HOST = process.env.MAILGUN_HOST || 'smtp.mailgun.org';
const MAILGUN_PORT = process.env.MAILGUN_PORT || 587;
const MAILGUN_USER = process.env.MAILGUN_USER || '';
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';

// Configure email transporter with Mailgun credentials
const getMailgunTransporter = () => {
  if (!MAILGUN_USER || !MAILGUN_API_KEY) {
    throw new Error('Missing Mailgun credentials in environment variables');
  }
  
  return nodemailer.createTransport({
    host: MAILGUN_HOST,
    port: MAILGUN_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: MAILGUN_USER,
      pass: MAILGUN_API_KEY
    }
  });
};

// Creates a test email account for development purposes if needed
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

// Get the appropriate email transporter
const getTransporter = async () => {
  try {
    // Try to use Mailgun transporter if credentials are available
    return getMailgunTransporter();
  } catch (error) {
    console.error('Failed to create Mailgun transporter, falling back to test account:', error);
    return await createTestAccount();
  }
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
      
      // Determine sender email
      const fromEmail = MAILGUN_DOMAIN ? `"STORE 26" <noreply@${MAILGUN_DOMAIN}>` : '"STORE 26" <noreply@store26.com>';
      
      // Send the email with the attached PDF
      const info = await transporter.sendMail({
        from: fromEmail,
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

      console.log('Email sent successfully:', info.messageId);
      
      // Log the Ethereal test URL only if we're using Ethereal
      if (info.messageUrl) {
        console.log('Preview URL:', info.messageUrl);
      }

      // Clean up the uploaded file after sending
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });

      res.status(200).json({ 
        success: true, 
        message: 'Invoice email sent successfully'
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