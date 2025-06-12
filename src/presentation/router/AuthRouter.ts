import { Router, Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import multer from 'multer';
import { AuthController } from '../controller/AuthController';
import { AuthValidators } from '../validators/AuthValidators';
import { ValidationMiddleware, SanitizationMiddleware } from '../middleware/index';
import { DIContainer } from '@/infrastructure/di/DIContainer';

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

    // Middleware to check if user is a restaurant owner
    const requireRestaurantOwner = (req: Request, res: Response, next: NextFunction): void => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || authReq.user.userType !== 'restaurant_owner') {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Only restaurant owners can access this endpoint'
        });
        return;
      }
      next();
    };

    // Get restaurant owner profile
    this.router.get(
      '/profile/restaurant-owner',
      authMiddleware.authenticate,
      requireRestaurantOwner,
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
      (req: Request, res: Response, next: NextFunction) => {
        this.upload.single('profileImage')(req as any, res as any, (err: any) => {
          if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
          } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
          }
          next();
        });
      },
      (req: Request, res: Response, next: NextFunction): void => {
        console.log('Before SanitizationMiddleware - req.body:', req.body);
        const file = (req as any).file;
        console.log('Before SanitizationMiddleware - req.file:', file);
        if (!file) {
          res.status(400).json({
            success: false,
            message: 'Profile image is required'
          });
          return;
        }
        next();
      },
      authMiddleware.authenticate,
      (req: Request, res: Response) => this.authController.uploadProfileImage(req as AuthenticatedRequest, res)
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
