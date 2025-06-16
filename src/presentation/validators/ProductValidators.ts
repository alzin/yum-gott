import { body, param, ValidationChain } from 'express-validator';
import { SizeOption } from '@/domain/entities/Product';

export class ProductValidators {
    static createProduct(): ValidationChain[] {
        return [
            body('category')
                .trim()
                .notEmpty()
                .withMessage('Category is required')
                .isLength({ max: 100 })
                .withMessage('Category must not exceed 100 characters'),
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
                .withMessage('Size must be one of: Small, Medium, Large')
        ];
    }

    static updateProduct(): ValidationChain[] {
        return [
            body('category')
                .optional()
                .trim()
                .isLength({ max: 100 })
                .withMessage('Category must not exceed 100 characters'),
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
                .withMessage('Size must be one of: Small, Medium, Large')
        ];
    }

    static productId(): ValidationChain[] {
        return [
            param('id')
                .isUUID()
                .withMessage('Invalid product ID format')
        ];
    }
}
