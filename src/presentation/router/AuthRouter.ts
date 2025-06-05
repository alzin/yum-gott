// src/presentation/router/AuthRouter.ts
import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controller/AuthController';
import { AuthValidators } from '../validators/AuthValidators';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { SanitizationMiddleware } from '../middleware/SanitizationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class AuthRouter {
  private router: Router;
  private upload: multer.Multer;

  constructor(private authController: AuthController) {
    this.router = Router();
    // Configure multer with file type and size validation
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
      authMiddleware.authenticate,
      (req: any, res, next) => {
        this.upload.single('profileImage')(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            return res.status(400).json({
              success: false,
              message: err.message === 'File too large' ? 'File size must not exceed 5MB' : 'Image upload error'
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
      SanitizationMiddleware.sanitizeProfileImageUpload(),
      this.authController.uploadProfileImage
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}