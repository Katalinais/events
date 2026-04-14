// UPLOAD_PATH: carpeta destino en disco (default: ./uploads)
// UPLOAD_MAX_SIZE_BYTES: tamaño máximo por archivo en bytes (default: 5242880 = 5 MB)
export const UPLOAD_DEFAULTS = {
  MAX_SIZE_BYTES: parseInt(process.env.UPLOAD_MAX_SIZE_BYTES ?? '') || 5 * 1024 * 1024,
  DESTINATION: process.env.UPLOAD_PATH || './uploads',
  ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_IMAGE_EXTS: /\.(jpe?g|png|gif|webp)$/i,
};
