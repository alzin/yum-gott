import { body, param, ValidationChain } from 'express-validator';

export class OrderValidators {
    static createOrder(): ValidationChain[] {
        return [
            body('customerId')
                .notEmpty()
                .withMessage('معرف العميل مطلوب')
                .isUUID()
                .withMessage('تنسيق معرف العميل غير صحيح'),

            body('productIds')
                .isArray({ min: 1 })
                .withMessage('يجب أن تحتوي قائمة المنتجات على عنصر واحد على الأقل'),

            body('productIds.*')
                .notEmpty()
                .withMessage('معرف المنتج مطلوب')
                .isUUID()
                .withMessage('تنسيق معرف المنتج غير صحيح'),

            body('optionIds')
                .optional()
                .isArray()
                .withMessage('يجب أن تكون قائمة معرفات الخيارات مصفوفة'),

            body('valueIds')
                .optional()
                .isArray()
                .withMessage('يجب أن تكون قائمة معرفات القيم مصفوفة')
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
