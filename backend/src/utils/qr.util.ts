import * as QRCode from 'qrcode';

export async function generateQRDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  });
}

export async function generateQRBuffer(content: string): Promise<Buffer> {
  return QRCode.toBuffer(content, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  });
}
