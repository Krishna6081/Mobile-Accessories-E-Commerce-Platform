const PDFDocument = require('pdfkit');

function generateInvoicePdf(order, stream) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('MOBILE ACCESSORIES STORE', { align: 'right' });
  doc.fontSize(10).text('123 Tech Park, MG Road, Bengaluru, India', { align: 'right' });
  doc.text('GSTIN: 29AAAAA0000A1Z5 | Support: support@accessories.com', { align: 'right' });
  doc.moveDown();

  doc.fontSize(16).text('INVOICE / RECEIPT', { underline: true });
  doc.moveDown();

  // Meta Info
  doc.fontSize(10).text(`Order Number: ${order.orderNumber}`);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.moveDown();

  // Addresses
  doc.fontSize(12).text('Shipping Address:');
  const ship = order.shippingAddress || {};
  doc.fontSize(10).text(`${ship.fullName || 'Customer'}`);
  doc.text(`${ship.addressLine1 || ''}, ${ship.addressLine2 || ''}`);
  doc.text(`${ship.city || ''}, ${ship.state || ''} - ${ship.pincode || ''}`);
  doc.text(`Phone: ${ship.mobile || ''}`);
  doc.moveDown();

  // Items Table Header
  doc.fontSize(11).text('Items:', { underline: true });
  doc.moveDown(0.5);

  let totalItemPrice = 0;
  if (order.items && order.items.length) {
    order.items.forEach((item, index) => {
      doc.fontSize(10).text(`${index + 1}. ${item.productName} (${item.variantInfo || 'Standard'}) - Qty: ${item.quantity} x ₹${item.price} = ₹${item.totalPrice}`);
      totalItemPrice += item.totalPrice;
    });
  }

  doc.moveDown();
  doc.fontSize(10).text(`Subtotal: ₹${order.subtotal || totalItemPrice}`);
  doc.text(`Discount: -₹${order.discount || 0}`);
  doc.text(`Shipping Fee: ₹${order.shippingFee || 0}`);
  doc.fontSize(12).text(`Grand Total: ₹${order.grandTotal}`, { bold: true });

  doc.moveDown(2);
  doc.fontSize(9).text('Thank you for shopping with Mobile Accessories Store!', { align: 'center' });

  doc.end();
}

module.exports = { generateInvoicePdf };
