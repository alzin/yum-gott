import { Request, Response } from 'express';
import { 
  RegisterCustomerUseCase, 
  RegisterRestaurantOwnerUseCase, 
  RestaurantOwnerLoginUseCase, 
  UploadProfileImageUseCase, 
  CustomerLoginUseCase, 
  UpdateRestaurantLocationUseCase,
  GetRestaurantOwnerProfileUseCase 
} from '@/application/use-cases/auth/index';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';

export class AuthController {
  constructor(
    private registerCustomerUseCase: RegisterCustomerUseCase,
    private registerRestaurantOwnerUseCase: RegisterRestaurantOwnerUseCase,
    private customerLoginUseCase: CustomerLoginUseCase,
    private restaurantOwnerLoginUseCase: RestaurantOwnerLoginUseCase,
    private uploadProfileImageUseCase: UploadProfileImageUseCase,
    private updateRestaurantLocationUseCase: UpdateRestaurantLocationUseCase,
    private getRestaurantOwnerProfileUseCase: GetRestaurantOwnerProfileUseCase
  ) {}



  registerCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const tokens = await this.registerCustomerUseCase.execute(req.body);
      this.setAuthCookies(res, tokens);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification link.'
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
      const tokens = await this.registerRestaurantOwnerUseCase.execute(req.body);
      this.setAuthCookies(res, tokens);
      res.status(201).json({
        success: true,
        message: 'Restaurant owner registration successful. Please check your email for verification link.',
       
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
          message: 'Email verified successfully. You can now login.'
        });
      } catch (customerError) {
        const user = await restaurantOwnerRepo.verifyEmail(token);
        res.status(200).json({
          success: true,
          message: 'Email verified successfully. You can now login.'
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed'
      });
    }
  };

  customerLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.customerLoginUseCase.execute(req.body);
      this.setAuthCookies(res, result.authToken);
      res.status(200).json({
        success: true,
        message: 'Customer login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  restaurantOwnerLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.restaurantOwnerLoginUseCase.execute(req.body);
      this.setAuthCookies(res, result.authToken);
      res.status(200).json({
        success: true,
        message: 'Restaurant owner login successful'
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

      const authRepository = DIContainer.getInstance().authRepository;
      const newTokens = await authRepository.refreshToken(refreshToken);
      this.setAuthCookies(res, newTokens);
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  };

  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('AuthController: Uploading profile image...');
      console.log('Request user:', (req as any).user);
      console.log('Request file:', req.file);

      const user = (req as any).user; // From AuthMiddleware
      if (!user) {
        console.log('AuthController: No user found in request');
        res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated'
        });
        return;
      }

      const request = {
        file: req.file,
        userId: user.userId,
      };

      console.log('Processing upload request:', request);

      const result = await this.uploadProfileImageUseCase.execute(request, user.userType);

      console.log('Upload successful:', result);

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: { profileImageUrl: result.profileImageUrl }
      });
    } catch (error) {
      console.error('AuthController: Upload failed:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Image upload failed'
      });
    }
  };

  updateRestaurantLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user; // From AuthMiddleware
      if (!user || user.userType !== 'restaurant_owner') {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Only restaurant owners can update location'
        });
        return;
      }

      const request = {
        userId: user.userId,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      };

      const result = await this.updateRestaurantLocationUseCase.execute(request);

      res.status(200).json({
        success: true,
        message: 'Restaurant location updated successfully',
        data: {
          address: result.restaurantOwner.address,
          latitude: result.restaurantOwner.latitude,
          longitude: result.restaurantOwner.longitude
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Location update failed'
      });
    }
  };


  getRestaurantOwnerProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user; // From AuthMiddleware
      if (!user || user.userType !== 'restaurant_owner') {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Only restaurant owners can access this endpoint'
        });
        return;
      }

      const result = await this.getRestaurantOwnerProfileUseCase.execute(user.userId);
      
      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message || 'Restaurant owner not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error getting restaurant owner profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching restaurant owner profile'
      });
    }
  };

  private setAuthCookies(res: Response, authToken: AuthToken): void {
    setAuthCookies(res, authToken);
  }
}
