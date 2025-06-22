import { body, ValidationChain } from 'express-validator';

export class CategoryValidators {
    static createCategory(): ValidationChain[] {
        return [
            body('name')
                .trim()
                .notEmpty()
                .withMessage('Category name is required')
                .isLength({ max: 100 })
                .withMessage('Category name must not exceed 100 characters')
        ];
    }
}