import { body, ValidationChain } from 'express-validator';

export class CategoryValidators {
    static createCategory(): ValidationChain[] {
        return [
            body('name')
                .trim()
                .notEmpty()
                .withMessage('Please enter a category name')
                .isLength({ max: 100 })
                .withMessage('Category name is too long')
        ];
    }
}