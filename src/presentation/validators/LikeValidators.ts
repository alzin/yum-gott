import { body, param, ValidationChain } from 'express-validator';

export class LikeValidators {
  static toggleLike(): ValidationChain[] {
    return [
      body('videoId')
        .notEmpty()
        .withMessage('يرجى إدخال معرف الفيديو')
        .isUUID()
        .withMessage('تنسيق معرف الفيديو غير صحيح')
    ];
  }

  static videoIdParam(): ValidationChain[] {
    return [
      param('videoId')
        .isUUID()
        .withMessage('تنسيق معرف الفيديو غير صحيح')
    ];
  }
}


