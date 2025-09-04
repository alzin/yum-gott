import { body, param, ValidationChain } from 'express-validator';

export class OrderValidators {
    static createOrder(): ValidationChain[] {
        return [
            body('productId')
                .notEmpty()
                .withMessage('معرف المنتج مطلوب')
                .isUUID()
                .withMessage('تنسيق معرف المنتج غير صحيح'),
                
            body('selectedOptions')
                .optional()
                .isArray()
                .withMessage('يجب أن تكون الخيارات المحددة مصفوفة'),
                
            body('selectedOptions.*.optionId')
                .if(body('selectedOptions').isArray())
                .notEmpty()
                .withMessage('معرف الخيار مطلوب')
                .isUUID()
                .withMessage('تنسيق معرف الخيار غير صحيح'),
                
            body('selectedOptions.*.valueId')
                .if(body('selectedOptions').isArray())
                .notEmpty()
                .withMessage('معرف القيمة المحددة مطلوب')
                .isUUID()
                .withMessage('تنسيق معرف القيمة المحددة غير صحيح')
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
