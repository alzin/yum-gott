import { Router, Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { AuthController } from '../controller/AuthController';
import { AuthValidators } from '../validators/AuthValidators';
import { ValidationMiddleware, SanitizationMiddleware } from '../middleware/index';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import multer from 'multer';

export class AuthRouter {
  private router: Router;
  private upload: multer.Multer;  

  constructor(private authController: AuthController) {
    const storage = multer.memoryStorage();
    this.upload = multer({  
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 } 
    });
    
    this.router = Router();
    this.setupRoutes();
  }


  private setupRoutes(): void {
    const authMiddleware = DIContainer.getInstance().authMiddleware;

    this.router.get(
      '/profile/restaurant-owner',
      authMiddleware.authenticate,
      authMiddleware.requireRestaurantOwner,
      (req: Request, res: Response) => this.authController.getRestaurantOwnerProfile(req as AuthenticatedRequest, res)
    );

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
      '/login/customer',
      SanitizationMiddleware.sanitizeLoginRequest(),
      AuthValidators.login(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.customerLogin
    );

    this.router.post(
      '/login/restaurant-owner',
      SanitizationMiddleware.sanitizeLoginRequest(),
      AuthValidators.login(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.restaurantOwnerLogin
    );

    this.router.post(
      '/profile/image',
      this.upload.single('profileImage'), 
      authMiddleware.authenticate,   
      AuthValidators.validateProfileImage(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.uploadProfileImage
    );
    this.router.post(
      '/location/restaurant',
      authMiddleware.authenticate,
      SanitizationMiddleware.sanitizeRestaurantLocationUpdate(),
      AuthValidators.updateRestaurantLocation(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.updateRestaurantLocation
    );


  }

  public getRouter(): Router {
    return this.router;
  }
}
