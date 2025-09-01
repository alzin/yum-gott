import { body, param, ValidationChain } from 'express-validator';

export class OrderValidators {
    static createOrder(): ValidationChain[] {
        return [
            body('productId')
                .notEmpty()
                .withMessage('معرف المنتج مطلوب')
                .isUUID()
                .withMessage('تنسيق معرف المنتج غير صحيح')
        ];
    }

    static orderIdParam(): ValidationChain[] {
        return [
            param('orderId')
                .isUUID()
                .withMessage('تنسيق معرف الطلب غير صحيح')
        ];
    }
}
