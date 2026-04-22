import { BadRequestException, Injectable } from '@nestjs/common';
import { UPLOAD_MESSAGES } from '../shared/messages';

@Injectable()
export class UploadService {
  validateFile(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException(UPLOAD_MESSAGES.NO_FILE_PROVIDED);
    }
  }

  buildFileUrl(filename: string): { url: string } {
    return { url: `/uploads/${filename}` };
  }
}
