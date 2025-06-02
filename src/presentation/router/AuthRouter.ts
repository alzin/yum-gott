import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { AuthValidators } from '../validators/AuthValidators';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class AuthRouter {
  private router: Router;

  constructor(private authController: AuthController) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Customer registration
    this.router.post(
      '/register/customer',
      AuthValidators.registerCustomer(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.registerCustomer
    );

    // Restaurant owner registration
    this.router.post(
      '/register/restaurant-owner',
      AuthValidators.registerRestaurantOwner(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.registerRestaurantOwner
    );

    // Login - supports both email and mobile number
    this.router.post(
      '/login',
      AuthValidators.login(),
      ValidationMiddleware.handleValidationErrors(),
      this.authController.login
    );
  }


  

  public getRouter(): Router {
    return this.router;
  }
}