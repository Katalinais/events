import * as PDFDocument from 'pdfkit';
import { generateQRBuffer } from './qr.util';

export interface TicketPdfDetail {
  categoryName: string;
  eventName: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface TicketPdfData {
  codigoQR: string;
  fechaVenta: Date;
  total: number;
  detalles: TicketPdfDetail[];
}

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

export async function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
  const qrBuffer = await generateQRBuffer(data.codigoQR);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──────────────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').text('Boletas de Entrada', { align: 'center' });
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(
        `Fecha de compra: ${data.fechaVenta.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        { align: 'center' },
      );
    doc.fillColor('#000000');

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(1);

    // ── Detalle de boletas ───────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').text('Detalle de boletas');
    doc.moveDown(0.5);

    // Table header
    const col = { cat: 50, event: 180, qty: 350, unit: 400, sub: 470 };
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('Categoría', col.cat, doc.y, { width: 120 })
      .text('Evento', col.event, doc.y - doc.currentLineHeight(), { width: 160 })
      .text('Cant.', col.qty, doc.y - doc.currentLineHeight(), { width: 45, align: 'right' })
      .text('P. Unit.', col.unit, doc.y - doc.currentLineHeight(), { width: 65, align: 'right' })
      .text('Subtotal', col.sub, doc.y - doc.currentLineHeight(), { width: 75, align: 'right' });

    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fillColor('#000000').fontSize(9);
    for (const d of data.detalles) {
      const y = doc.y;
      doc.text(d.categoryName, col.cat, y, { width: 120 });
      doc.text(d.eventName, col.event, y, { width: 160 });
      doc.text(String(d.cantidad), col.qty, y, { width: 45, align: 'right' });
      doc.text(COP.format(d.precioUnitario), col.unit, y, { width: 65, align: 'right' });
      doc.text(COP.format(d.subtotal), col.sub, y, { width: 75, align: 'right' });
      doc.moveDown(0.6);
    }

    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.5);

    // Total
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Total: ${COP.format(data.total)}`, { align: 'right' });

    doc.moveDown(2);

    // ── QR Code ─────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(1);

    const qrX = (595 - 150) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: 150, height: 150 });
    doc.moveDown(0.3);
    doc.y += 150;

    doc.moveDown(0.5);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Código de verificación', { align: 'center' });
    doc.moveDown(0.2);
    doc
      .fontSize(7)
      .font('Helvetica')
      .text(data.codigoQR, { align: 'center' });

    doc.end();
  });
}
