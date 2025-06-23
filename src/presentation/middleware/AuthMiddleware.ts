import { Request, Response, NextFunction } from 'express';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { JWTpayload } from '@/domain/entities/AuthToken';
import { setAuthCookies } from '@/shared/utils/cookieUtils';

export interface AuthenticatedRequest extends Request {
  user?: JWTpayload;
}

export class AuthMiddleware {
  constructor(private authRepository: IAuthRepository) { }

  private extractToken(req: Request): string | null {
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private async tryRefreshToken(req: Request, res: Response): Promise<JWTpayload | null> {
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = this.extractToken(req);
    if (!refreshToken || !accessToken) return null;

    try {
      const newTokens = await this.authRepository.refreshToken(refreshToken);
      setAuthCookies(res, newTokens);
      return await this.authRepository.verifyToken(newTokens.accessToken);
    } catch (error) {
      return null;
    }
  }

  requireRestaurantOwner = (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || authReq.user.userType !== 'restaurant_owner') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only restaurant owners can access this endpoint',
      });
      return;
    }
    next();
  };

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token = this.extractToken(req);

      if (!token) {
        res.status(401).json({ success: false, message: 'Access token required' });
        return;
      }

      let payload = await this.authRepository.verifyToken(token);
      req.user = payload;

      // Perform token rotation
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const newTokens = await this.authRepository.refreshToken(refreshToken);
          setAuthCookies(res, newTokens);
          payload = await this.authRepository.verifyToken(newTokens.accessToken);
          req.user = payload;
        } catch (error) {
          console.warn('Token rotation failed:', error);
          // Proceed with the current valid token
        }
      }

      next();
    } catch (error) {
      const refreshedPayload = await this.tryRefreshToken(req, res);
      if (refreshedPayload) {
        req.user = refreshedPayload;
        next();
      } else {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
    }
  };
}