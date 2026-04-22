import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Options as MulterOptions } from 'multer';
import { UPLOAD_DEFAULTS } from './upload.constants';
import { UPLOAD_MESSAGES } from '../shared/messages';

export interface ImageUploadConfig {
  /** Prefijo del nombre de archivo generado. Default: 'file' */
  prefix?: string;
  /** Carpeta destino. Default: UPLOAD_PATH env var o './uploads' */
  destination?: string;
  /** Tamaño máximo en bytes. Default: UPLOAD_MAX_SIZE_BYTES env var o 5 MB */
  maxSizeBytes?: number;
}

/**
 * Retorna las opciones de Multer listas para usar en FileInterceptor.
 *
 * @example
 * \@UseInterceptors(FileInterceptor('image', createImageMulterOptions({ prefix: 'event' })))
 */
export function createImageMulterOptions(config?: ImageUploadConfig): MulterOptions {
  const destination = config?.destination ?? UPLOAD_DEFAULTS.DESTINATION;
  const maxSizeBytes = config?.maxSizeBytes ?? UPLOAD_DEFAULTS.MAX_SIZE_BYTES;
  const prefix = config?.prefix ?? 'file';

  return {
    limits: { fileSize: maxSizeBytes },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      const validExt = UPLOAD_DEFAULTS.ALLOWED_IMAGE_EXTS.test(ext);
      const validMime = UPLOAD_DEFAULTS.ALLOWED_IMAGE_MIMES.includes(file.mimetype);
      if (!validExt && !validMime) {
        cb(new BadRequestException(UPLOAD_MESSAGES.INVALID_FILE_TYPE));
        return;
      }
      cb(null, true);
    },
    storage: diskStorage({
      destination,
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname) || '.jpg';
        cb(null, `${prefix}-${Date.now()}${ext}`);
      },
    }),
  };
}
