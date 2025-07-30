import { body, query, ValidationChain } from 'express-validator';
import { Network } from '@/domain/entities/Videos';

export class VideoValidators {
    static createVideo(): ValidationChain[] {
        return [
            body('publicId')
                .trim()
                .notEmpty()
                .withMessage('Public ID is required')
                .isLength({ max: 255 })
                .withMessage('Public ID must not exceed 255 characters'),
            body('secureUrl')
                .trim()
                .notEmpty()
                .withMessage('Secure URL is required')
                .isURL()
                .withMessage('Invalid URL format')
                .isLength({ max: 255 })
                .withMessage('Secure URL must not exceed 255 characters'),
            body('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('Name is required')
                .isLength({ min: 2, max: 100 })
                .withMessage('Name must be between 2 and 100 characters'),
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('Phone number is required'),
            // .matches(/^[0-9]{10,15}$/)
            // .withMessage('Phone number must be 10-15 digits'),
            body('network')
                .notEmpty()
                .withMessage('Network is required')
                .isIn(Object.values(Network))
                .withMessage('Network must be either MTN or Syriatel'),
            body('invoiceImage')
                .custom((_, { req }) => {
                    if (!req.file) {
                        throw new Error('Invoice image is required');
                    }
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error('Only JPEG or PNG images are allowed');
                    }
                    return true;
                })
        ];
    }

    static updateVideo(): ValidationChain[] {
        return [
            body('publicId')
                .trim()
                .notEmpty()
                .withMessage('Public ID is required')
                .isLength({ max: 255 })
                .withMessage('Public ID must not exceed 255 characters'),
            body('secureUrl')
                .trim()
                .notEmpty()
                .withMessage('Secure URL is required')
                .isURL()
                .withMessage('Invalid URL format')
                .isLength({ max: 255 })
                .withMessage('Secure URL must not exceed 255 characters'),
            body('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('Name is required')
                .isLength({ min: 2, max: 100 })
                .withMessage('Name must be between 2 and 100 characters'),
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('Phone number is required'),
            // .matches(/^[0-9]{10,15}$/)
            // .withMessage('Phone number must be 10-15 digits'),
            body('network')
                .notEmpty()
                .withMessage('Network is required')
                .isIn(Object.values(Network))
                .withMessage('Network must be either MTN or Syriatel'),
            body('invoiceImage')
                .optional()
                .custom((_, { req }) => {
                    if (req.file) {
                        const allowedTypes = ['image/jpeg', 'image/png'];
                        if (!allowedTypes.includes(req.file.mimetype)) {
                            throw new Error('Only JPEG or PNG images are allowed');
                        }
                    }
                    return true;
                })
        ];
    }

    static getAcceptedVideos(): ValidationChain[] {
        return [
            query('limit')
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage('Limit must be a number between 1 and 100'),
            query('cursor')
                .optional()
                .isISO8601()
                .withMessage('Cursor must be a valid ISO 8601 date string')
        ];
    }
}