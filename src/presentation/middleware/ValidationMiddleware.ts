// import { Request, Response, NextFunction } from 'express';
// import { validationResult, ValidationError } from 'express-validator';

// export class ValidationMiddleware {
//   static handleValidationErrors() {
//     return (req: Request, res: Response, next: NextFunction): void => {
//       const errors = validationResult(req);

//       if (!errors.isEmpty()) {
//         const formattedErrors = errors.array().map((error: ValidationError) => ({
//           field: error.type === 'field' ? error.path : 'general',
//           message: error.msg,
//           value: error.type === 'field' ? error.value : undefined
//         }));

//         res.status(400).json({
//           success: false,
//           message: 'Validation failed',
//           errors: formattedErrors
//         });
//         return;
//       }
//       next();
//     };
//   }
// }




import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export class ValidationMiddleware {
  static handleValidationErrors() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const firstMsg = errors.array()[0]?.msg;
        const message = typeof firstMsg === 'string' ? firstMsg : 'Validation failed';

        res.status(400).json({ success: false, message });
        return;
      }
      next();
    };
  }
}