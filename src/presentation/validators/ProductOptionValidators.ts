import { body, param, ValidationChain } from 'express-validator';

export class ProductOptionValidators {
    static createProductOption(): ValidationChain[] {
        return [
            param('productId')
                .isUUID()
                .withMessage('Please provide a valid product ID'),
            body('name')
                .trim()
                .notEmpty()
                .withMessage('Please enter an option name')
                .isLength({ max: 100 })
                .withMessage('Option name is too long')
        ];
    }

    static createProductOptionValue(): ValidationChain[] {
        return [
            param('optionId')
                .isUUID()
                .withMessage('Please provide a valid option ID'),
            body('name')
                .trim()
                .notEmpty()
                .withMessage('Please enter an option value name')
                .isLength({ max: 100 })
                .withMessage('Option value name is too long'),
            body('additionalPrice')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('Additional price must be zero or a positive number')
        ];
    }

    static optionId(): ValidationChain[] {
        return [
            param('optionId')
                .isUUID()
                .withMessage('Please provide a valid option ID')
        ];
    }

    static valueId(): ValidationChain[] {
        return [
            param('valueId')
                .isUUID()
                .withMessage('Please provide a valid value ID')
        ];
    }
}
