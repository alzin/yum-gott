import { body, param, ValidationChain } from 'express-validator';
import { SizeName } from '@/domain/entities/Product';

export class ProductValidators {
    static createProduct(): ValidationChain[] {
        return [
            body('categoryName')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم الفئة')
                .isLength({ max: 255 })
                .withMessage('اسم الفئة طويل جداً'),
            body('productName')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم المنتج')
                .isLength({ max: 255 })
                .withMessage('اسم المنتج طويل جداً'),
            body('description')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال وصف المنتج'),
            body('price')
                .notEmpty()
                .withMessage('يرجى إدخال السعر')
                .isFloat({ min: 0 })
                .withMessage('يجب أن يكون السعر رقماً موجباً'),
            body('discount')
                .optional()
                .isFloat({ min: 0, max: 100 })
                .withMessage('يجب أن تكون نسبة الخصم بين 0% و 100%'),
            body('sizeOptions')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('يرجى إدخال خيارات الحجم بشكل صحيح');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('يجب إدخال خيارات الحجم كقائمة');
                    }
                    for (const size of parsedValue) {
                        if (!Object.values(SizeName).includes(size.name)) {
                            throw new Error(`يرجى اختيار حجم صحيح من: ${Object.values(SizeName).join(', ')}`);
                        }
                        if (typeof size.additionalPrice !== 'number' || size.additionalPrice < 0) {
                            throw new Error('يجب أن يكون السعر الإضافي صفراً أو رقماً موجباً');
                        }
                    }
                    return true;
                }),
            body('image')
                .custom((_, { req }) => {
                    if (!req.file) {
                        throw new Error('يرجى رفع صورة المنتج');
                    }
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error('يرجى رفع صورة بصيغة JPEG أو PNG');
                    }
                    return true;
                }),
            body('options')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('يرجى إدخال الخيارات بشكل صحيح');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('يجب إدخال الخيارات كقائمة');
                    }
                    for (const option of parsedValue) {
                        if (typeof option.name !== 'string' || !option.name.trim()) {
                            throw new Error('يجب أن يكون لكل خيار اسم صحيح');
                        }
                        if (typeof option.required !== 'boolean') {
                            throw new Error('يجب تحديد ما إذا كان الخيار مطلوبًا');
                        }
                        if (!Array.isArray(option.values)) {
                            throw new Error('يجب أن يكون لكل خيار قائمة بالقيم الممكنة');
                        }
                        for (const value of option.values) {
                            if (typeof value.name !== 'string' || !value.name.trim()) {
                                throw new Error('يجب أن يكون لكل قيمة خيار اسم صحيح');
                            }
                            if (value.additionalPrice !== undefined && (typeof value.additionalPrice !== 'number' || value.additionalPrice < 0)) {
                                throw new Error('يجب أن تكون الأسعار الإضافية صفراً أو أرقاماً موجبة');
                            }
                        }
                    }
                    return true;
                })
        ];
    }

    static updateProduct(): ValidationChain[] {
        return [
            body('categoryName')
                .trim()
                .notEmpty()
                .withMessage('يرجى إدخال اسم الفئة')
                .isLength({ max: 255 })
                .withMessage('اسم الفئة طويل جداً'),
            body('productName')
                .optional()
                .trim()
                .isLength({ max: 255 })
                .withMessage('اسم المنتج طويل جداً'),
            body('description')
                .optional()
                .trim(),
            body('price')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('يجب أن يكون السعر رقماً موجباً'),
            body('discount')
                .optional()
                .isFloat({ min: 0, max: 100 })
                .withMessage('يجب أن تكون نسبة الخصم بين 0% و 100%'),
            body('sizeOptions')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('يرجى إدخال خيارات الحجم بشكل صحيح');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('يجب إدخال خيارات الحجم كقائمة');
                    }
                    for (const size of parsedValue) {
                        if (!Object.values(SizeName).includes(size.name)) {
                            throw new Error(`يرجى اختيار حجم صحيح من: ${Object.values(SizeName).join(', ')}`);
                        }
                        if (typeof size.additionalPrice !== 'number' || size.additionalPrice < 0) {
                            throw new Error('يجب أن يكون السعر الإضافي صفراً أو رقماً موجباً');
                        }
                    }
                    return true;
                }),
            body('image')
                .optional()
                .custom((_, { req }) => {
                    if (req.file) {
                        const allowedTypes = ['image/jpeg', 'image/png'];
                        if (!allowedTypes.includes(req.file.mimetype)) {
                            throw new Error('يرجى رفع صورة بصيغة JPEG أو PNG');
                        }
                    }
                    return true;
                }),
            body('options')
                .optional()
                .custom((value) => {
                    if (!value) return true;
                    let parsedValue = value;
                    if (typeof value === 'string') {
                        try {
                            parsedValue = JSON.parse(value);
                        } catch (error) {
                            throw new Error('يرجى إدخال الخيارات بشكل صحيح');
                        }
                    }
                    if (!Array.isArray(parsedValue)) {
                        throw new Error('يجب أن تكون الخيارات مصفوفة');
                    }
                    for (const option of parsedValue) {
                        if (typeof option.name !== 'string' || !option.name.trim()) {
                            throw new Error('يجب أن يكون لكل خيار اسم صحيح');
                        }
                        if (typeof option.required !== 'boolean') {
                            throw new Error('يجب أن يحتوي كل خيار على حقل مطلوب من نوع منطقي');
                        }
                        if (!Array.isArray(option.values)) {
                            throw new Error('يجب أن يكون لكل خيار مصفوفة قيم');
                        }
                        for (const value of option.values) {
                            if (typeof value.name !== 'string' || !value.name.trim()) {
                                throw new Error('يجب أن يكون لكل قيمة خيار اسم صحيح');
                            }
                            if (value.additionalPrice !== undefined && (typeof value.additionalPrice !== 'number' || value.additionalPrice < 0)) {
                                throw new Error('يجب أن يكون السعر الإضافي لكل قيمة خيار رقماً غير سالب إذا تم إدخاله');
                            }
                        }
                    }
                    return true;
                })
        ];
    }

    static productId(): ValidationChain[] {
        return [
            param('id')
                .isUUID()
                .withMessage('تنسيق معرف المنتج غير صحيح')
        ];
    }

    static productIdParam(): ValidationChain[] {
        return [
            param('productId')
                .isUUID()
                .withMessage('تنسيق معرف المنتج غير صحيح')
        ];
    }
}