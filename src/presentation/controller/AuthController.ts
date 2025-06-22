import { Request, Response } from 'express';
import { LogoutRequest, LogoutUseCase } from '@/application/use-cases/auth/LogoutuseCase';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';
import { AuthenticatedRequest } from '../middleware';

export class AuthController {
  private logoutUseCase: LogoutUseCase;

    constructor() {
    this.logoutUseCase = DIContainer.getInstance().resolve('logoutUseCase');
  }

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


      logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const refreshToken = req.cookies.refreshToken;

      if (!user || !refreshToken) {
        res.status(400).json({
          success: false,
          message: 'No active session found'
        });
        return;
      }

      const request: LogoutRequest = {
        refreshToken,
        userId: user.userId,
        userType: user.userType
      };

      const result = await this.logoutUseCase.execute(request, res);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed'
      });
    }
  };

  private setAuthCookies(res: Response, authToken: AuthToken): void {
    setAuthCookies(res, authToken);
  }
}
