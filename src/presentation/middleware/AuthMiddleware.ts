import { Request, Response, NextFunction } from 'express';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { JWTpayload } from '@/domain/entities/AuthToken';

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

  requireCustomer = (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || authReq.user.userType !== 'customer') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only customers can access this endpoint',
      });
      return;
    }
    next();
  };

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

  requireNonGuest = (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || authReq.user.userType === 'guest') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Guests are not allowed to perform this action',
      });
      return;
    }
    next();
  };

  authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token = this.extractToken(req);

      if (!token) {
        res.status(401).json({ success: false, message: 'Access token required' });
        return;
      }

      let payload = await this.authRepository.verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };
}