import { body, ValidationChain } from 'express-validator';

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
        .withMessage('Email must not exceed 255 characters'),

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
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

      // Ensure restaurant owner specific fields are not present
      body('restaurantName')
        .not()
        .exists()
        .withMessage('Restaurant name should not be provided for customer registration'),

      body('organizationNumber')
        .not()
        .exists()
        .withMessage('Organization number should not be provided for customer registration')
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
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

      // Ensure customer specific fields are not present
      body('name')
        .not()
        .exists()
        .withMessage('Name should not be provided for restaurant owner registration'),

      body('email')
        .not()
        .exists()
        .withMessage('Email should not be provided for restaurant owner registration')
    ];
  }

  static login(): ValidationChain[] {
    return [
      body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

      body('mobileNumber')
        .optional()
        .trim()
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Mobile number must be 10-15 digits'),

      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 1 })
        .withMessage('Password cannot be empty'),

      // Custom validation to ensure either email or mobileNumber is provided
      body()
        .custom((value, { req }) => {
          if (!req.body.email && !req.body.mobileNumber) {
            throw new Error('Either email or mobile number is required');
          }
          return true;
        })
    ];
  }
}