import { Router, Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import {
  getRestaurantOwnerProfile,
  getCustomerProfile,
  registerCustomer,
  registerRestaurantOwner,
  customerLogin,
  restaurantOwnerLogin,
  verifyEmail,
  uploadProfileImage,
  updateRestaurantLocation,
  DeleteCustomerAccountController,
  DeleteRestaurantOwnerAccountController
} from '../controller/Users';
import { AuthValidators } from '../validators/AuthValidators';
import { ValidationMiddleware, SanitizationMiddleware } from '../middleware/index';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import multer from 'multer';
import { AuthController } from '../controller/AuthController';
import { EditCustomerProfileController } from '../controller/Users/Customer/EditCustomerProfileController';

export class AuthRouter {
  private router: Router;
  private upload: multer.Multer;
  private diContainer: DIContainer;
  private authController: AuthController;

  constructor() {
    const storage = multer.memoryStorage();
    this.upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }
    });

    this.diContainer = DIContainer.getInstance();
    this.authController = new AuthController();
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    const authMiddleware = this.diContainer.authMiddleware;

    this.router.get(
      '/profile/restaurant-owner',
      authMiddleware.authenticateUser,
      authMiddleware.requireRestaurantOwner,
      (req: Request, res: Response) => {
        const controller = new getRestaurantOwnerProfile(this.diContainer.resolve('getRestaurantOwnerProfileUseCase'));
        controller.getRestaurantOwnerProfile(req as AuthenticatedRequest, res);
      }
    );

    this.router.get(
      '/profile/customer',
      authMiddleware.authenticateUser,
      authMiddleware.requireCustomer,
      (req: Request, res: Response) => {
        const controller = new getCustomerProfile(this.diContainer.resolve('getCustomerProfileUseCase'));
        controller.getCustomerProfile(req as AuthenticatedRequest, res);
      }
    );

    this.router.post(
      '/register/customer',
      SanitizationMiddleware.sanitizeCustomerRegistration(),
      AuthValidators.registerCustomer(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new registerCustomer(this.diContainer.resolve('registerCustomerUseCase'));
        controller.registerCustomer(req, res);
      }
    );

    this.router.post(
      '/register/restaurant-owner',
      SanitizationMiddleware.sanitizeRestaurantOwnerRegistration(),
      AuthValidators.registerRestaurantOwner(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new registerRestaurantOwner(this.diContainer.resolve('registerRestaurantOwnerUseCase'));
        controller.registerRestaurantOwner(req, res);
      }
    );

    this.router.get(
      '/verify',
      (req: Request, res: Response) => {
        const controller = new verifyEmail();
        controller.verifyEmail(req, res);
      }
    );

    this.router.post(
      '/login/customer',
      SanitizationMiddleware.sanitizeLoginRequest(),
      AuthValidators.login(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new customerLogin(this.diContainer.resolve('customerLoginUseCase'));
        controller.customerLogin(req, res);
      }
    );

    this.router.post(
      '/login/restaurant-owner',
      SanitizationMiddleware.sanitizeLoginRequest(),
      AuthValidators.login(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new restaurantOwnerLogin(this.diContainer.resolve('restaurantOwnerLoginUseCase'));
        controller.restaurantOwnerLogin(req, res);
      }
    );

    this.router.post(
      '/profile/image',
      this.upload.single('profileImage'),
      authMiddleware.authenticateUser,
      AuthValidators.validateProfileImage(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new uploadProfileImage(this.diContainer.resolve('uploadProfileImageUseCase'));
        controller.uploadProfileImage(req, res);
      }
    );

    this.router.post(
      '/location/restaurant',
      authMiddleware.authenticateUser,
      SanitizationMiddleware.sanitizeRestaurantLocationUpdate(),
      AuthValidators.updateRestaurantLocation(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new updateRestaurantLocation(this.diContainer.resolve('updateRestaurantLocationUseCase'));
        controller.updateRestaurantLocation(req, res);
      }
    );

    this.router.post(
      '/refresh-token',
      this.authController.refreshToken
    );

    this.router.post(
      '/logout',
      authMiddleware.authenticateUser,
      (req: Request, res: Response) => {
        this.authController.logout(req as AuthenticatedRequest, res)
      }
    );

    this.router.delete(
      '/account/customer',
      authMiddleware.authenticateUser,
      authMiddleware.requireCustomer,
      (req: Request, res: Response) => {
        const controller = new DeleteCustomerAccountController(this.diContainer.resolve('deleteCustomerAccountUseCase'));
        controller.deleteCustomerAccount(req as AuthenticatedRequest, res);
      }
    );

    this.router.delete(
      '/account/restaurant-owner',
      authMiddleware.authenticateUser,
      authMiddleware.requireRestaurantOwner,
      (req: Request, res: Response) => {
        const controller = new DeleteRestaurantOwnerAccountController(this.diContainer.resolve('deleteRestaurantOwnerAccountUseCase'));
        controller.deleteRestaurantOwnerAccount(req as AuthenticatedRequest, res);
      }
    );

    this.router.post(
      '/change-password',
      authMiddleware.authenticateUser,
      SanitizationMiddleware.sanitizeChangePassword(),
      AuthValidators.changePassword(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => this.authController.changePassword(req as AuthenticatedRequest, res)
    );

    this.router.put(
      '/profile/customer',
      authMiddleware.authenticateUser,
      authMiddleware.requireCustomer,
      AuthValidators.updateCustomerProfile(),
      ValidationMiddleware.handleValidationErrors(),
      (req: Request, res: Response) => {
        const controller = new EditCustomerProfileController(this.diContainer.resolve('updateCustomerProfileUseCase'));
        controller.editProfile(req as AuthenticatedRequest, res);
      }
    );

  }


  public getRouter(): Router {
    return this.router;
  }
}
