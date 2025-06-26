import { body, ValidationChain } from 'express-validator';
import multer from 'multer';

export const fileUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Allow only one file
  }
});

export class AuthValidators {
  static registerCustomer(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters')
        .custom((value) => {
          const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const parts = value.split('@');
          if (parts.length !== 2 || !domainRegex.test(parts[1])) {
            throw new Error('Invalid email domain (e.g., no repeated .com)');
          }
          if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
            throw new Error('Email domain contains repeated extensions');
          }
          return true;
        }),
      body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Mobile number must be 10-15 digits'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password must be between 6 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    ];
  }

  static registerRestaurantOwner(): ValidationChain[] {
    return [
      body('restaurantName')
        .trim()
        .notEmpty()
        .withMessage('Restaurant name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Restaurant name must be between 2 and 255 characters'),
      body('organizationNumber')
        .trim()
        .notEmpty()
        .withMessage('Organization number is required')
        .isLength({ min: 5, max: 50 })
        .withMessage('Organization number must be between 5 and 50 characters')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Organization number must contain only uppercase letters and numbers'),
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters')
        .custom((value) => {
          const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const parts = value.split('@');
          if (parts.length !== 2 || !domainRegex.test(parts[1])) {
            throw new Error('Invalid email domain (e.g., no repeated .com)');
          }
          if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
            throw new Error('Email domain contains repeated extensions');
          }
          return true;
        }),
      body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Mobile number must be 10-15 digits'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password must be between 6 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    ];
  }

  static login(): ValidationChain[] {
    return [
      body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters')
        .custom((value) => {
          if (!value) return true;
          const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const parts = value.split('@');
          if (parts.length !== 2 || !domainRegex.test(parts[1])) {
            throw new Error('Invalid email domain (e.g., no repeated .com)');
          }
          if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
            throw new Error('Email domain contains repeated extensions');
          }
          return true;
        }),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
      body().custom((value) => {
        if (!value.email) {
          throw new Error('Email is required');
        }
        return true;
      })
    ];
  }

  static updateRestaurantLocation(): ValidationChain[] {
    return [
      body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ max: 255 })
        .withMessage('Address must not exceed 255 characters'),
      body('latitude')
        .notEmpty()
        .withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be a number between -90 and 90')
        .toFloat(),
      body('longitude')
        .notEmpty()
        .withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be a number between -180 and 180')
        .toFloat()
    ];
  }

  static validateProfileImage(): ValidationChain[] {
    return [
      body('profileImage')
        .custom((_, { req }) => {
          if (!req.file) {
            throw new Error('Profile image is required');
          }
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(req.file.mimetype)) {
            throw new Error('Only JPEG, PNG, and GIF images are allowed');
          }
          return true;
        })
    ];
  }


}
