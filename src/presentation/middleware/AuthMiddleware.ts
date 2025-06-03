import { Request, Response, NextFunction } from 'express';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { JWTpayload } from '@/domain/entities/AuthToken'; // Fixed import - use domain JWTpayload

export interface AuthenticatedRequest extends Request {
  user?: JWTpayload; // Use domain JWTpayload instead of jwt.JwtPayload
}

export class AuthMiddleware {
  constructor(private authRepository: IAuthRepository) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ 
          success: false,
          message: 'Access token required' 
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = await this.authRepository.verifyToken(token);
      
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  };
}