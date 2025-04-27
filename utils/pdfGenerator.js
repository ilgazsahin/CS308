const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Generate a PDF invoice from order data
 * @param {Object} orderData - Order details
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
const generateInvoicePDF = async (orderData) => {
  try {
    // Get order date
    const orderDate = orderData.createdAt || orderData.orderDate || new Date();
    
    // Get total
    const totalAmount = orderData.totalAmount || orderData.total || 0;
    
    // Generate a unique invoice number based on order ID and date
    const invoiceNumber = `INV-${orderData._id || orderData.orderId}-${Date.now().toString().slice(-6)}`;

    // Format order items for HTML
    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td>${item.title}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Get customer address
    const shippingInfo = orderData.shippingInfo || {};
    const address = orderData.shippingAddress || 
      (shippingInfo ? 
        `${shippingInfo.address || ''}, ${shippingInfo.city || ''}, ${shippingInfo.state || ''} ${shippingInfo.zip || ''}, ${shippingInfo.country || ''}` : 
        'Not provided');

    // Create HTML for the invoice
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .company-details {
            text-align: right;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #3366cc;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table th, table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          table th {
            background-color: #f8f8f8;
            text-align: left;
          }
          .totals {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="invoice-header">
            <div>
              <h1 class="invoice-title">INVOICE</h1>
              <p>Invoice #: ${invoiceNumber}</p>
              <p>Date: ${new Date(orderDate).toLocaleDateString()}</p>
              <p>Order #: ${orderData._id || orderData.orderId}</p>
            </div>
            <div class="company-details">
              <h2>CS308 Project</h2>
              <p>BookStore</p>
              <p>Istanbul, Turkey</p>
              <p>store26order@gmail.com</p>
            </div>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p>${shippingInfo.name || 'Customer'}</p>
            <p>${address}</p>
            <p>${shippingInfo.email || ''}</p>
            <p>${shippingInfo.phone || ''}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr>
                <td colspan="3" style="text-align: right;">Subtotal:</td>
                <td style="text-align: right;">$${totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;">Tax (0%):</td>
                <td style="text-align: right;">$0.00</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total:</td>
                <td style="text-align: right;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment is due within 30 days of receipt of this invoice.</p>
            <p>This is an automatically generated invoice for your order.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Launch headless browser
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Set content and generate PDF
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = {
  generateInvoicePDF
}; 