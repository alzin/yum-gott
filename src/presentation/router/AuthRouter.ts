import { Router, Request, Response, NextFunction } from 'express'; // تأكد من استيراد الأنواع
import multer from 'multer';
import { AuthController } from '../controller/AuthController';
import { AuthValidators } from '../validators/AuthValidators';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { SanitizationMiddleware } from '../middleware/SanitizationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import dayjs from 'dayjs';

export class AuthRouter {
  private router: Router;
  private upload: multer.Multer;

  constructor(private authController: AuthController) {
    this.router = Router();
    this.upload = multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      }
    });
    this.setupRoutes();
  }

  private setupRoutes(): void {
    const authMiddleware = DIContainer.getInstance().authMiddleware;

    this.router.post(
      '/register/customer',
      SanitizationMiddleware.sanitizeCustomerRegistration(),
      AuthValidators.registerCustomer(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.registerCustomer
    );

    this.router.post(
      '/register/restaurant-owner',
      SanitizationMiddleware.sanitizeRestaurantOwnerRegistration(),
      AuthValidators.registerRestaurantOwner(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.registerRestaurantOwner
    );

    this.router.get(
      '/verify',
      this.authController.verifyEmail
    );

    this.router.post(
      '/login',
      SanitizationMiddleware.sanitizeLoginRequest(),
      AuthValidators.login(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.login
    );

   this.router.post(
  '/profile/image',
  (req: Request, res: Response, next: NextFunction) => {
    this.upload.single('profileImage')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Unexpected field: ${err.field}. Expected 'profileImage'.`
          });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size must not exceed 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Image upload error'
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  },
  (req: Request, res: Response, next: NextFunction): void => {
    console.log('Before SanitizationMiddleware - req.body:', req.body);
    console.log('Before SanitizationMiddleware - req.file:', req.file);
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Profile image is required'
      });
      return;
    }
    if (!req.body.userType) {
      res.status(400).json({
        success: false,
        message: 'User type is required'
      });
      return;
    }
    next();
  },
  SanitizationMiddleware.sanitizeProfileImageUpload(),
  authMiddleware.authenticate,
  this.authController.uploadProfileImage
);

    this.router.get('/server-time', (req, res) => {
      const currentTime = dayjs().unix();
      res.status(200).json({
        success: true,
        message: 'Server time retrieved successfully',
        data: {
          timestamp: currentTime,
          date: dayjs().toISOString(),
        },
      });
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}