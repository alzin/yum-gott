import { Request, Response, NextFunction } from 'express';
import xss from 'xss'; 

export class SanitizationMiddleware {
  static allowedFields(allowedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const sanitizedBody: Record<string, any> = {};

      if (typeof req.body === 'object' && req.body !== null) {
        for (const field of allowedFields) {
          if (field in req.body) {
            sanitizedBody[field] = xss(req.body[field]); // تنظيف القيمة باستخدام xss
          }
        }
      }

      req.body = sanitizedBody;
      next();
    };
  }

  static excludeFields(excludedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // تحقق من أن req.body هو كائن صالح
      if (typeof req.body === 'object' && req.body !== null) {
        for (const field of excludedFields) {
          delete req.body[field];
        }
      }
      next();
    };
  }

  static sanitizeCustomerRegistration() {
    return SanitizationMiddleware.allowedFields([
      'name',
      'email',
      'mobileNumber',
      'password'
    ]);
  }

  static sanitizeRestaurantOwnerRegistration() {
    return SanitizationMiddleware.allowedFields([
      'restaurantName',
      'organizationNumber',
      'mobileNumber',
      'email',
      'password'
    ]);
  }

  static sanitizeLoginRequest() {
    return SanitizationMiddleware.allowedFields([
      'email',
      'password'
    ]);
  }

  static sanitizeProfileImageUpload() {
    return SanitizationMiddleware.allowedFields([
      'userType'
    ]);
  }
}