import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware';
import { LogoutUseCase, RefreshTokenUseCase, ChangePasswordUseCase } from '@/application/use-cases/auth';
import { AuthToken } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { OtpVerificationUseCase } from '../../application/use-cases/auth/OtpVerificationUseCase';
import { UnimtxSmsService } from '../../infrastructure/services/UnimtxSmsService';
import { InMemoryOtpVerificationRepository } from '../../infrastructure/repositories/OtpVerificationRepository';

const otpService = new UnimtxSmsService();
const otpRepo = new InMemoryOtpVerificationRepository();
const otpUseCase = new OtpVerificationUseCase(otpService, otpRepo);

export const requestOtp = async (req: any, res: any) => {

  const { phone } = req.body;
  try {
    await otpUseCase.requestOtp(phone);
    res.status(200).json({ message: 'OTP sent' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyOtp = async (req: any, res: any) => {
  const { phone, code } = req.body;
  try {
    await otpUseCase.verifyOtp(phone, code);
    res.status(200).json({ message: 'OTP verified' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export class AuthController {
  private logoutUseCase: LogoutUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private changePasswordUseCase: ChangePasswordUseCase;

  constructor() {
    const diContainer = DIContainer.getInstance();
    this.logoutUseCase = diContainer.resolve('logoutUseCase');
    this.refreshTokenUseCase = diContainer.resolve('refreshTokenUseCase');
    this.changePasswordUseCase = diContainer.resolve('changePasswordUseCase');
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
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

  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };

      const result = await this.changePasswordUseCase.execute(
        { userId: user.userId, oldPassword, newPassword },
        user.userType
      );

      res.status(200).json({ success: result.success, message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to change password' });
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