import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../../errors/AppError';

export class UploadsService {
  private readonly allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async processAndSaveImage(file: Express.Multer.File, businessId: string): Promise<string> {
    // 1. MIME Validation (Double check even if multer filters)
    if (!this.allowedMimes.includes(file.mimetype)) {
      throw new AppError(`Invalid file type. Allowed: ${this.allowedMimes.join(', ')}`, 400);
    }

    // 2. EXIF Stripping & Processing
    // We strip metadata to protect privacy (remove GPS, device info)
    const fileName = `${businessId}-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(this.uploadDir, fileName);

    try {
      // Sharp strips metadata by default unless .withMetadata() is called
      await sharp(file.buffer)
        .rotate() // Auto-rotate based on orientation tag before stripping it
        .toFile(filePath);
        
      return `/uploads/${fileName}`;
    } catch (error) {
      console.error('[UploadsService] Processing failed:', error);
      throw new AppError('Failed to process image', 500);
    }
  }

  async deleteFile(filePath: string) {
    try {
      const fullPath = path.join(process.cwd(), filePath.startsWith('/') ? filePath.substring(1) : filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('[UploadsService] Deletion failed:', error);
    }
  }
}
