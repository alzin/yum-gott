import { body, param, ValidationChain } from 'express-validator';

export class ProductOptionValidators {
    static createProductOption(): ValidationChain[] {
        return [
            param('productId')
                .isUUID()
                .withMessage('Invalid product ID format'),
            body('name')
                .trim()
                .notEmpty()
                .withMessage('Option name is required')
                .isLength({ max: 100 })
                .withMessage('Option name must not exceed 100 characters')
        ];
    }

    static createProductOptionValue(): ValidationChain[] {
        return [
            param('optionId')
                .isUUID()
                .withMessage('Invalid option ID format'),
            body('name')
                .trim()
                .notEmpty()
                .withMessage('Option value name is required')
                .isLength({ max: 100 })
                .withMessage('Option value name must not exceed 100 characters'),
            body('additionalPrice')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('Additional price must be a positive number')
        ];
    }

    static optionId(): ValidationChain[] {
        return [
            param('optionId')
                .isUUID()
                .withMessage('Invalid option ID format')
        ];
    }

    static valueId(): ValidationChain[] {
        return [
            param('valueId')
                .isUUID()
                .withMessage('Invalid value ID format')
        ];
    }
}
