import { body, param, ValidationChain } from 'express-validator';
import { SizeName } from '@/domain/entities/Product';

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
            body('sizeOptions')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('Invalid sizeOptions format: must be a valid JSON array');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('Size options must be an array');
                    }
                    for (const size of parsedValue) {
                        if (!Object.values(SizeName).includes(size.name)) {
                            throw new Error(`Size name must be one of: ${Object.values(SizeName).join(', ')}`);
                        }
                        if (typeof size.additionalPrice !== 'number' || size.additionalPrice < 0) {
                            throw new Error('Each size option must have a non-negative additionalPrice');
                        }
                    }
                    return true;
                }),
            body('image')
                .custom((_, { req }) => {
                    if (!req.file) {
                        throw new Error('Image is required');
                    }
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error('Only JPEG or PNG images are allowed');
                    }
                    return true;
                }),
            body('options')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('Invalid options format: must be a valid JSON array');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('Options must be an array');
                    }
                    for (const option of parsedValue) {
                        if (typeof option.name !== 'string' || !option.name.trim()) {
                            throw new Error('Each option must have a valid name');
                        }
                        if (typeof option.required !== 'boolean') {
                            throw new Error('Each option must have a required boolean field');
                        }
                        if (!Array.isArray(option.values)) {
                            throw new Error('Each option must have a values array');
                        }
                        for (const value of option.values) {
                            if (typeof value.name !== 'string' || !value.name.trim()) {
                                throw new Error('Each option value must have a valid name');
                            }
                            if (value.additionalPrice !== undefined && (typeof value.additionalPrice !== 'number' || value.additionalPrice < 0)) {
                                throw new Error('Each option value additionalPrice must be a non-negative number if provided');
                            }
                        }
                    }
                    return true;
                })
        ];
    }

    static updateProduct(): ValidationChain[] {
        return [
            body('categoryName')
                .trim()
                .notEmpty()
                .withMessage('Category name is required')
                .isLength({ max: 255 })
                .withMessage('Category name must not exceed 255 characters'),
            body('productName')
                .optional()
                .trim()
                .isLength({ max: 255 })
                .withMessage('Product name must not be too long'),
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
            body('sizeOptions')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('Invalid sizeOptions format: must be a valid JSON array');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('Size options must be an array');
                    }
                    for (const size of parsedValue) {
                        if (!Object.values(SizeName).includes(size.name)) {
                            throw new Error(`Size name must be one of: ${Object.values(SizeName).join(', ')}`);
                        }
                        if (typeof size.additionalPrice !== 'number' || size.additionalPrice < 0) {
                            throw new Error('Each size option must have a non-negative additionalPrice');
                        }
                    }
                    return true;
                }),
            body('image')
                .optional()
                .custom((_, { req }) => {
                    if (req.file) {
                        const allowedTypes = ['image/jpeg', 'image/png'];
                        if (!allowedTypes.includes(req.file.mimetype)) {
                            throw new Error('Only JPEG or PNG images are allowed');
                        }
                    }
                    return true;
                }),
            body('options')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('Invalid options format: must be a valid JSON array');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('Options must be an array');
                    }
                    for (const option of parsedValue) {
                        if (typeof option.name !== 'string' || !option.name.trim()) {
                            throw new Error('Each option must have a valid name');
                        }
                        if (typeof option.required !== 'boolean') {
                            throw new Error('Each option must have a required boolean field');
                        }
                        if (!Array.isArray(option.values)) {
                            throw new Error('Each option must have a values array');
                        }
                        for (const value of option.values) {
                            if (typeof value.name !== 'string' || !value.name.trim()) {
                                throw new Error('Each option value must have a valid name');
                            }
                            if (value.additionalPrice !== undefined && (typeof value.additionalPrice !== 'number' || value.additionalPrice < 0)) {
                                throw new Error('Each option value additionalPrice must be a non-negative number if provided');
                            }
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