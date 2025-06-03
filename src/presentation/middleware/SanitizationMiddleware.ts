import { Request, Response, NextFunction } from 'express';

export class SanitizationMiddleware {
  /**
   * Sanitize request body to only allow specified fields
   */
  static allowedFields(allowedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const sanitizedBody: Record<string, any> = {};

      // Only include allowed fields
      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field)) {
          sanitizedBody[field] = req.body[field];
        }
      }

      // Replace request body with sanitized version
      req.body = sanitizedBody;
      next();
    };
  }

  /**
   * Remove specified fields from request body
   */
  static excludeFields(excludedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      for (const field of excludedFields) {
        delete req.body[field];
      }
      next();
    };
  }

  /**
   * Sanitize customer registration request
   */
  static sanitizeCustomerRegistration() {
    return SanitizationMiddleware.allowedFields([
      'name',
      'email',
      'mobileNumber',
      'password'
    ]);
  }

  /**
   * Sanitize restaurant owner registration request
   */
  static sanitizeRestaurantOwnerRegistration() {
    return SanitizationMiddleware.allowedFields([
      'restaurantName',
      'organizationNumber',
      'mobileNumber',
      'email',
      'password'
    ]);
  }

  /**
   * Sanitize login request
   */
  static sanitizeLoginRequest() {
    return SanitizationMiddleware.allowedFields([
      'mobileNumber',
      'password'
    ]);
  }
}