import { Request, Response } from 'express';
import { RegisterCustomerUseCase } from '@/application/use-cases/auth/RegisterCustomerUseCase';
import { RegisterRestaurantOwnerUseCase } from '@/application/use-cases/auth/RegisterResturantOwnerUseCases';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';

export class AuthController {
  constructor(
    private registerCustomerUseCase: RegisterCustomerUseCase,
    private registerRestaurantOwnerUseCase: RegisterRestaurantOwnerUseCase,
    private loginUseCase: LoginUseCase
  ) {}

  registerCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = await this.registerCustomerUseCase.execute(req.body);
      
      // Remove password from response
      const { password, ...customerResponse } = customer;
      
      res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        data: customerResponse
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  registerRestaurantOwner = async (req: Request, res: Response): Promise<void> => {
    try {
      const owner = await this.registerRestaurantOwnerUseCase.execute(req.body);
      
      // Remove password from response
      const { password, ...ownerResponse } = owner;
      
      res.status(201).json({
        success: true,
        message: 'Restaurant owner registered successfully',
        data: ownerResponse
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };
}