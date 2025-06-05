import { Request, Response } from 'express';
import { RegisterCustomerUseCase } from '@/application/use-cases/auth/RegisterCustomerUseCase';
import { RegisterRestaurantOwnerUseCase } from '@/application/use-cases/auth/RegisterResturantOwnerUseCases';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { UploadProfileImageUseCase } from '@/application/use-cases/auth/UploadProfileImageUseCase';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class AuthController {
  constructor(
    private registerCustomerUseCase: RegisterCustomerUseCase,
    private registerRestaurantOwnerUseCase: RegisterRestaurantOwnerUseCase,
    private loginUseCase: LoginUseCase,
    private uploadProfileImageUseCase: UploadProfileImageUseCase
  ) {}

  registerCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.registerCustomerUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Customer registration initiated. Please check your email for verification link.'
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
      await this.registerRestaurantOwnerUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Restaurant owner registration initiated. Please check your email for verification link.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
        return;
      }

      const diContainer = DIContainer.getInstance();
      const customerRepo = diContainer.customerRepository;
      const restaurantOwnerRepo = diContainer.restaurantOwnerRepository;

      try {
        const user = await customerRepo.verifyEmail(token);
        res.status(200).json({
          success: true,
          message: 'Email verified successfully. You can now login.',
        });
      } catch (customerError) {
        const user = await restaurantOwnerRepo.verifyEmail(token);
        res.status(200).json({
          success: true,
          message: 'Email verified successfully. You can now login.',
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      
      this.setAuthCookies(res, result.authToken);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
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

  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user; // From AuthMiddleware
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated'
        });
        return;
      }

      const request = {
        file: req.file,
        userId: user.userId,
        userType: user.userType
      };

      const result = await this.uploadProfileImageUseCase.execute(request);
      
      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: { profileImageUrl: result.profileImageUrl }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Image upload failed'
      });
    }
  };

  private setAuthCookies(res: Response, authToken: any): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', authToken.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: authToken.expiresIn * 1000,
      path: '/'
    });

    res.cookie('refreshToken', authToken.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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