import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  validateFile(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException('No image file was provided');
    }
  }

  buildFileUrl(filename: string): { url: string } {
    return { url: `/uploads/${filename}` };
  }
}
