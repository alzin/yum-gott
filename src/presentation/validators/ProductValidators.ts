import { body, param, ValidationChain } from 'express-validator';
import { SizeOption } from '@/domain/entities/Product';

export class ProductValidators {
    static createProduct(): ValidationChain[] {
        return [
            body('categoryName')
            .trim()
            .notEmpty()
            .withMessage('Category name is required')
            .isLength({ max: 255 })
            .withMessage('Category name must not exceed 255 characters'),
            body('productName')
                .trim()
                .notEmpty()
                .withMessage('Product name is required')
                .isLength({ max: 255 })
                .withMessage('Product name must not exceed 255 characters'),
            body('description')
                .trim()
                .notEmpty()
                .withMessage('Description is required'),
            body('price')
                .notEmpty()
                .withMessage('Price is required')
                .isFloat({ min: 0 })
                .withMessage('Price must be a positive number'),
            body('discount')
                .optional()
                .isFloat({ min: 0, max: 100 })
                .withMessage('Discount must be between 0 and 100'),
            body('addSize')
                .optional()
                .isIn(Object.values(SizeOption))
                .withMessage('Size must be one of: Small, Medium, Large'),
            body('image')
                .custom((_, { req }) => {
                    if (!req.file) {
                        throw new Error('Product image is required');
                    }
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error('Only JPEG, PNG, and GIF images are allowed');
                    }
                    return true;
                })
        ];
    }
 
    static updateProduct(): ValidationChain[] {
        return [
            body('categoryName')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Category name must not exceed 255 characters'),
            body('productName')
                .optional()
                .trim()
                .isLength({ max: 255 })
                .withMessage('Product name must not exceed 255 characters'),
            body('description')
                .optional()
                .trim(),
            body('price')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('Price must be a positive number'),
            body('discount')
                .optional()
                .isFloat({ min: 0, max: 100 })
                .withMessage('Discount must be between 0 and 100'),
            body('addSize')
                .optional()
                .isIn(Object.values(SizeOption))
                .withMessage('Size must be one of: Small, Medium, Large'),
            body('image')
                .optional()
                .custom((_, { req }) => {
                    if (req.file) {
                        const allowedTypes = ['image/jpeg', 'image/png'];
                        if (!allowedTypes.includes(req.file.mimetype)) {
                            throw new Error('Only JPEG, PNG, and GIF images are allowed');
                        }
                    }
                    return true;
                })
        ];
    }

    static productId(): ValidationChain[] {
        return [
            param('id')
                .isUUID()
                .withMessage('Invalid product ID format')
        ];
    }

    static productIdParam(): ValidationChain[] {
        return [
            param('productId')
                .isUUID()
                .withMessage('Invalid product ID format')
        ];
    }
}