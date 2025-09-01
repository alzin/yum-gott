import { body, param, ValidationChain } from 'express-validator';

export class CommentValidators {
    static createComment(): ValidationChain[] {
        return [
            body('videoId')
                .notEmpty()
                .withMessage('يرجى إدخال معرف الفيديو')
                .isUUID()
                .withMessage('تنسيق معرف الفيديو غير صحيح'),
            body('content')
                .trim()
                .notEmpty()
                .withMessage('لا يمكن أن يكون محتوى التعليق فارغًا')
                .isLength({ max: 1000 })
                .withMessage('يجب ألا يتجاوز محتوى التعليق 1000 حرف')
        ];
    }



    static videoIdParam(): ValidationChain[] {
        return [
            param('videoId')
                .isUUID()
                .withMessage('تنسيق معرف الفيديو غير صحيح')
        ];
    }

    static commentIdParam(): ValidationChain[] {
        return [
            param('id')
                .isUUID()
                .withMessage('تنسيق معرف التعليق غير صحيح')
        ];
    }
}


