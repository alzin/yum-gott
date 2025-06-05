import { Request, Response, NextFunction } from 'express';

export class SanitizationMiddleware {
  static allowedFields(allowedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const sanitizedBody: Record<string, any> = {};

      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field)) {
          sanitizedBody[field] = req.body[field];
        }
      }

      req.body = sanitizedBody;
      next();
    };
  }

  static excludeFields(excludedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      for (const field of excludedFields) {
        delete req.body[field];
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