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
        // data: {
        //   user: customerResponse
        // }
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
        // data: {
        //   user: ownerResponse
        // }
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
      
      // Set HTTP-only cookies for tokens
      this.setAuthCookies(res, result.authToken);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        // data: {
        //   user: result.user
        // }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // Clear authentication cookies
      this.clearAuthCookies(res);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not found'
        });
        return;
      }

      // You'll need to add this method to your LoginUseCase or create a new RefreshTokenUseCase
      // const newTokens = await this.refreshTokenUseCase.execute(refreshToken);
      
      // For now, we'll use the auth repository directly
      // This should be moved to a use case for better architecture
      const authRepository = require('@/infrastructure/di/DIContainer').DIContainer.getInstance().authRepository;
      const newTokens = await authRepository.refreshToken(refreshToken);
      
      this.setAuthCookies(res, newTokens);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      this.clearAuthCookies(res);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  };

  private setAuthCookies(res: Response, authToken: any): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set access token cookie
    res.cookie('accessToken', authToken.accessToken, {
      httpOnly: true,
      secure: isProduction, // Only use HTTPS in production
      sameSite: 'strict',
      maxAge: authToken.expiresIn * 1000, // Convert to milliseconds
      path: '/'
    });

    // Set refresh token cookie with longer expiration
    res.cookie('refreshToken', authToken.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/'
    });
  }

  private clearAuthCookies(res: Response): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}