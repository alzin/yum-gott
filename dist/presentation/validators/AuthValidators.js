"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidators = void 0;
const express_validator_1 = require("express-validator");
class AuthValidators {
    static registerCustomer() {
        return [
            (0, express_validator_1.body)('name')
                .trim()
                .notEmpty()
                .withMessage('Name is required')
                .isLength({ min: 2, max: 100 })
                .withMessage('Name must be between 2 and 100 characters')
                .matches(/^[a-zA-Z\s]+$/)
                .withMessage('Name can only contain letters and spaces'),
            (0, express_validator_1.body)('email')
                .trim()
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Invalid email format')
                .normalizeEmail()
                .isLength({ max: 255 })
                .withMessage('Email must not exceed 255 characters'),
            (0, express_validator_1.body)('mobileNumber')
                .trim()
                .notEmpty()
                .withMessage('Mobile number is required')
                .matches(/^[0-9]{10,15}$/)
                .withMessage('Mobile number must be 10-15 digits'),
            (0, express_validator_1.body)('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6, max: 100 })
                .withMessage('Password must be between 6 and 100 characters')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
        ];
    }
    static registerRestaurantOwner() {
        return [
            (0, express_validator_1.body)('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('Restaurant name is required')
                .isLength({ min: 2, max: 255 })
                .withMessage('Restaurant name must be between 2 and 255 characters'),
            (0, express_validator_1.body)('organizationNumber')
                .trim()
                .notEmpty()
                .withMessage('Organization number is required')
                .isLength({ min: 5, max: 50 })
                .withMessage('Organization number must be between 5 and 50 characters')
                .matches(/^[A-Z0-9]+$/)
                .withMessage('Organization number must contain only uppercase letters and numbers'),
            (0, express_validator_1.body)('mobileNumber')
                .trim()
                .notEmpty()
                .withMessage('Mobile number is required')
                .matches(/^[0-9]{10,15}$/)
                .withMessage('Mobile number must be 10-15 digits'),
            (0, express_validator_1.body)('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6, max: 100 })
                .withMessage('Password must be between 6 and 100 characters')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
        ];
    }
    static login() {
        return [
            (0, express_validator_1.body)('email')
                .trim()
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Invalid email format')
                .normalizeEmail()
                .isLength({ max: 255 })
                .withMessage('Email must not exceed 255 characters'),
            (0, express_validator_1.body)('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 1 })
                .withMessage('Password cannot be empty')
        ];
    }
}
exports.AuthValidators = AuthValidators;
