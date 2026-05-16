import { Request, Response, NextFunction } from 'express';
import { UploadsService } from './uploads.service';
import { AppError } from '../../errors/AppError';

export class UploadsController {
  private uploadsService: UploadsService;

  constructor() {
    this.uploadsService = new UploadsService();
  }

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      // Get businessId from auth (multi-tenant isolation)
      const businessId = (req as any).user?.businessId || 'global';
      
      const url = await this.uploadsService.processAndSaveImage(req.file, businessId);

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url,
          fileName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
