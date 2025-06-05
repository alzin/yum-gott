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
    this.upload = multer({ storage: multer.memoryStorage() });
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
      this.upload.single('profileImage'),
      SanitizationMiddleware.sanitizeProfileImageUpload(),
      this.authController.uploadProfileImage
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}