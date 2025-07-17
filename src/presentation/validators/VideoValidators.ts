import { body, ValidationChain } from 'express-validator';
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
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('Phone number is required')
                .matches(/^[0-9]{10,15}$/)
                .withMessage('Phone number must be 10-15 digits'),
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
}