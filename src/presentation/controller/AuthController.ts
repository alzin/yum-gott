import { Request, Response } from 'express';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';

export class AuthController {

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

  private setAuthCookies(res: Response, authToken: AuthToken): void {
    setAuthCookies(res, authToken);
  }
}
