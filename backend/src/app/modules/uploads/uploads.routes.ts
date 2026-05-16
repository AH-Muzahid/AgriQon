import { Router } from 'express';
import multer from 'multer';
import { UploadsController } from './uploads.controller';
import { AppError } from '../../errors/AppError';

const router = Router();
const controller = new UploadsController();

// Multer memory storage - we process it with sharp in the service
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only images (JPEG, PNG, WEBP) are allowed', 400) as any);
    }
  },
});

router.post('/image', upload.single('image'), controller.uploadImage);

export const UploadsRoutes = router;
