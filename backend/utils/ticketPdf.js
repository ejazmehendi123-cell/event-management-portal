const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Streams a styled one-page PDF "ticket" directly to the given response.
// Mirrors the ticket-stub look used in the frontend UI.
const streamTicketPdf = async (res, { registration, event, attendee }) => {
  const qrPayload = `EVENTHUB-TICKET:${registration._id}`;
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 220 });
  const qrImage = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  const doc = new PDFDocument({ size: [420, 620], margins: { top: 0, bottom: 0, left: 0, right: 0 } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${registration._id}.pdf"`);
  doc.pipe(res);

  const inkColor = '#1B1F3B';
  const goldColor = '#E8A33D';
  const mutedColor = '#6b6f8a';

  // Header block
  doc.rect(0, 0, 420, 150).fill(inkColor);
  doc.fillColor(goldColor).fontSize(11).text('EVENTHUB · ADMIT ONE', 30, 34, { characterSpacing: 1.5 });
  doc.fillColor('#ffffff').fontSize(22).text(event.title, 30, 56, { width: 300, lineGap: 2 });
  doc.fillColor('#c9cbe0').fontSize(10).text(event.category, 30, 116);

  // Body: event + attendee details
  let y = 175;
  const row = (label, value) => {
    doc.fillColor(mutedColor).fontSize(9).text(label.toUpperCase(), 30, y, { characterSpacing: 1 });
    doc.fillColor(inkColor).fontSize(13).text(value, 30, y + 13, { width: 360 });
    y += 48;
  };

  row('Attendee', attendee.name);
  row('Date', new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
  row('Time', event.time);
  row('Location', event.location);
  row('Registration status', registration.status.charAt(0).toUpperCase() + registration.status.slice(1));

  // Perforated divider
  const dividerY = y + 4;
  doc.save();
  doc.dash(4, { space: 4 }).moveTo(20, dividerY).lineTo(400, dividerY).strokeColor('#d8d5c9').stroke();
  doc.undash();
  doc.circle(20, dividerY, 10).fill('#F7F5F0');
  doc.circle(400, dividerY, 10).fill('#F7F5F0');
  doc.restore();

  // QR + footer
  doc.image(qrImage, 145, dividerY + 30, { width: 130, height: 130 });
  doc.fillColor(mutedColor).fontSize(8).text(`Ticket ID: ${registration._id}`, 30, dividerY + 175, { width: 360, align: 'center' });
  doc.fillColor(mutedColor).fontSize(8).text('Present this ticket (digital or printed) at check-in.', 30, dividerY + 190, {
    width: 360,
    align: 'center',
  });

  doc.end();
};

module.exports = { streamTicketPdf };
