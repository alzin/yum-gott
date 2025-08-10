import { body, param, ValidationChain } from 'express-validator';

export class LikeValidators {
  static toggleLike(): ValidationChain[] {
    return [
      body('videoId')
        .notEmpty()
        .withMessage('Please provide a video ID')
        .isUUID()
        .withMessage('Invalid video ID format')
    ];
  }

  static videoIdParam(): ValidationChain[] {
    return [
      param('videoId')
        .isUUID()
        .withMessage('Invalid video ID format')
    ];
  }
}


