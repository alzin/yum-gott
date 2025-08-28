import { body, ValidationChain } from 'express-validator';

export class OpeningHoursValidators {
    static createOpeningHours(): ValidationChain[] {
        return [
            body('day')
                .trim()
                .notEmpty()
                .withMessage('يرجى اختيار يوم من أيام الأسبوع')
                .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
                .withMessage('يرجى اختيار يوم صحيح من أيام الأسبوع'),
            body('Working_hours')
                .if(body('isClosed').equals('false'))
                .isArray({ min: 1 })
                .withMessage('يرجى إضافة فترة عمل واحدة على الأقل عند فتح النشاط'),
            body('Working_hours.*.startTime')
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('يرجى إدخال وقت بدء لكل فترة عمل')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('يجب أن يكون وقت البدء بصيغة HH:mm:ss (مثال: 09:00:00)'),
            body('Working_hours.*.endTime')
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('يرجى إدخال وقت انتهاء لكل فترة عمل')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('يجب أن يكون وقت الانتهاء بصيغة HH:mm:ss (مثال: 18:00:00)'),
            body('isClosed')
                .isBoolean()
                .withMessage('يرجى تحديد ما إذا كان النشاط مغلقًا (صحيح أو خطأ)'),
            body().custom((value) => {
                if (value.isClosed && value.Working_hours && value.Working_hours.length > 0) {
                    throw new Error('يجب أن تكون فترات العمل فارغة عند إغلاق النشاط');
                }
                return true;
            })
        ];
    }

    static updateOpeningHours(): ValidationChain[] {
        return [
            body('day')
                .optional()
                .trim()
                .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
                .withMessage('يرجى اختيار يوم صحيح من أيام الأسبوع'),
            body('Working_hours')
                .optional()
                .if(body('isClosed').equals('false'))
                .isArray({ min: 1 })
                .withMessage('يرجى إضافة فترة عمل واحدة على الأقل عند فتح النشاط'),
            body('Working_hours.*.startTime')
                .optional()
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('يرجى إدخال وقت بدء لكل فترة عمل')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('يجب أن يكون وقت البدء بصيغة HH:mm:ss (مثال: 09:00:00)'),
            body('Working_hours.*.endTime')
                .optional()
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('يرجى إدخال وقت انتهاء لكل فترة عمل')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('يجب أن يكون وقت الانتهاء بصيغة HH:mm:ss (مثال: 18:00:00)'),
            body('isClosed')
                .optional()
                .isBoolean()
                .withMessage('يرجى تحديد ما إذا كان النشاط مغلقًا (صحيح أو خطأ)'),
            body().custom((value) => {
                if (value.isClosed && value.Working_hours && value.Working_hours.length > 0) {
                    throw new Error('لا يجب إدخال فترات العمل عند إغلاق النشاط');
                }
                return true;
            })
        ];
    }
}