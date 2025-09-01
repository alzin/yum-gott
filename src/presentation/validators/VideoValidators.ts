import { body, query, ValidationChain } from 'express-validator';
import { Network } from '@/domain/entities/Videos';

export class VideoValidators {
    static createVideo(): ValidationChain[] {
        return [
            body('publicId')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال معرف عام')
                .isLength({ max: 255 })
                .withMessage('معرف عام طويل جداً'),
            body('secureUrl')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال رابط آمن')
                .isURL()
                .withMessage('يرجى إدخال رابط صحيح')
                .isLength({ max: 255 })
                .withMessage('رابط آمن طويل جداً'),
            body('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم المطعم')
                .isLength({ min: 2, max: 100 })
                .withMessage('يجب أن يكون اسم المطعم بين 2 و 100 حرف'),
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال رقم الهاتف'),
            // .matches(/^[0-9]{10,15}$/)
            // .withMessage('Phone number must be 10-15 digits'),
            body('network')
                .notEmpty()
                .withMessage('يرجى اختيار الشبكة')
                .isIn(Object.values(Network))
                .withMessage('يرجى اختيار MTN أو Syriatel'),
            body('invoiceImage')
                .custom((_, { req }) => {
                    if (!req.file) {
                        throw new Error('يرجى رفع صورة الفاتورة');
                    }
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error('يرجى رفع صورة بصيغة JPEG أو PNG');
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
                .withMessage('يرجى إدخال معرف عام')
                .isLength({ max: 255 })
                .withMessage('معرف عام طويل جداً'),
            body('secureUrl')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال رابط آمن')
                .isURL()
                .withMessage('يرجى إدخال رابط صحيح')
                .isLength({ max: 255 })
                .withMessage('رابط آمن طويل جداً'),
            body('restaurantName')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم المطعم')
                .isLength({ min: 2, max: 100 })
                .withMessage('يجب أن يكون اسم المطعم بين 2 و 100 حرف'),
            body('phoneNumber')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال رقم الهاتف'),
            // .matches(/^[0-9]{10,15}$/)
            // .withMessage('Phone number must be 10-15 digits'),
            body('network')
                .notEmpty()
                .withMessage('يرجى اختيار الشبكة')
                .isIn(Object.values(Network))
                .withMessage('يرجى اختيار MTN أو Syriatel'),
            body('invoiceImage')
                .optional()
                .custom((_, { req }) => {
                    if (req.file) {
                        const allowedTypes = ['image/jpeg', 'image/png'];
                        if (!allowedTypes.includes(req.file.mimetype)) {
                            throw new Error('يرجى رفع صورة بصيغة JPEG أو PNG');
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
                .withMessage('يجب أن يكون الحد بين 1 و 100'),
            query('cursor')
                .optional()
            // .isISO8601()
            // .withMessage('Cursor must be a valid ISO 8601 date string')
        ];
    }
}