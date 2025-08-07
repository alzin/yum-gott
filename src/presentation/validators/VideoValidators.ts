import { body, query, ValidationChain } from 'express-validator';
import { Network } from '@/domain/entities/Videos';

export class VideoValidators {
    static createVideo(): ValidationChain[] {
        return [
            body('publicId')
                .trim()
                .notEmpty()
                .withMessage('Please provide a public ID')
                .isLength({ max: 255 })
                .withMessage('Public ID is too long'),
            body('secureUrl')
                .trim()
                .notEmpty()
                .withMessage('Please provide a secure URL')
                .isURL()
                .withMessage('Please enter a valid URL')
                .isLength({ max: 255 })
                .withMessage('Secure URL is too long'),
            body('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('Please enter the restaurant name')
                .isLength({ min: 2, max: 100 })
                .withMessage('Restaurant name must be between 2 and 100 characters'),
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('Please enter the phone number'),
            // .matches(/^[0-9]{10,15}$/)
            // .withMessage('Phone number must be 10-15 digits'),
            body('network')
                .notEmpty()
                .withMessage('Please select a network')
                .isIn(Object.values(Network))
                .withMessage('Please select either MTN or Syriatel'),
            body('invoiceImage')
                .custom((_, { req }) => {
                    if (!req.file) {
                        throw new Error('Please upload an invoice image');
                    }
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error('Please upload an image in JPEG or PNG format');
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
                .withMessage('Please provide a public ID')
                .isLength({ max: 255 })
                .withMessage('Public ID is too long'),
            body('secureUrl')
                .trim()
                .notEmpty()
                .withMessage('Please provide a secure URL')
                .isURL()
                .withMessage('Please enter a valid URL')
                .isLength({ max: 255 })
                .withMessage('Secure URL is too long'),
            body('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('Please enter the restaurant name')
                .isLength({ min: 2, max: 100 })
                .withMessage('Restaurant name must be between 2 and 100 characters'),
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('Please enter the phone number'),
            // .matches(/^[0-9]{10,15}$/)
            // .withMessage('Phone number must be 10-15 digits'),
            body('network')
                .notEmpty()
                .withMessage('Please select a network')
                .isIn(Object.values(Network))
                .withMessage('Please select either MTN or Syriatel'),
            body('invoiceImage')
                .optional()
                .custom((_, { req }) => {
                    if (req.file) {
                        const allowedTypes = ['image/jpeg', 'image/png'];
                        if (!allowedTypes.includes(req.file.mimetype)) {
                            throw new Error('Please upload an image in JPEG or PNG format');
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
                // .isISO8601()
                // .withMessage('Cursor must be a valid ISO 8601 date string')
        ];
    }
}