import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware';
import { LogoutUseCase, RefreshTokenUseCase } from '@/application/use-cases/auth';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class AuthController {
  private logoutUseCase: LogoutUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;

  constructor() {
    const diContainer = DIContainer.getInstance();
    this.logoutUseCase = diContainer.resolve('logoutUseCase');
    this.refreshTokenUseCase = diContainer.resolve('refreshTokenUseCase');
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const accessToken = req.cookies.accessToken;

      if (!refreshToken || !accessToken) {
        res.status(401).json({
          success: false,
          message: 'Both access and refresh tokens are required',
        });
        return;
      }

      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      this.setAuthCookies(res, result.authToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid refresh token',
      });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const refreshToken = req.cookies.refreshToken;
      const accessToken = req.cookies.accessToken;

      if (!user || !refreshToken) {
        res.status(400).json({
          success: false,
          message: 'No active session found',
        });
        return;
      }

      const request = {  
        refreshToken,
        userId: user.userId,
        userType: user.userType,
        accessToken
      };

      const result = await this.logoutUseCase.execute(request, res);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  };

  private setAuthCookies(res: Response, authToken: AuthToken): void {
    setAuthCookies(res, authToken);
  }
}