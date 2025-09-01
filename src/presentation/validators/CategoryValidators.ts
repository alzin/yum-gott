import { body, ValidationChain } from 'express-validator';

export class CategoryValidators {
    static createCategory(): ValidationChain[] {
        return [
            body('name')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم الفئة')
                .isLength({ max: 100 })
                .withMessage('اسم الفئة طويل جداً')
        ];
    }
}