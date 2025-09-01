import { body, param, ValidationChain } from 'express-validator';

export class ProductOptionValidators {
    static createProductOption(): ValidationChain[] {
        return [
            param('productId')
                .isUUID()
                .withMessage('يرجى إدخال معرف منتج صحيح'),
            body('name')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم الخيار')
                .isLength({ max: 100 })
                .withMessage('اسم الخيار طويل جداً')
        ];
    }

    static createProductOptionValue(): ValidationChain[] {
        return [
            param('optionId')
                .isUUID()
                .withMessage('يرجى إدخال معرف خيار صحيح'),
            body('name')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم قيمة الخيار')
                .isLength({ max: 100 })
                .withMessage('اسم قيمة الخيار طويل جداً'),
            body('additionalPrice')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('يجب أن يكون السعر الإضافي صفراً أو رقماً موجباً')
        ];
    }

    static optionId(): ValidationChain[] {
        return [
            param('optionId')
                .isUUID()
                .withMessage('يرجى إدخال معرف خيار صحيح')
        ];
    }

    static valueId(): ValidationChain[] {
        return [
            param('valueId')
                .isUUID()
                .withMessage('يرجى إدخال معرف قيمة صحيح')
        ];
    }
}
