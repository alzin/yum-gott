import { body, param, ValidationChain } from 'express-validator';

export class CommentValidators {
    static createComment(): ValidationChain[] {
        return [
            body('videoId')
                .notEmpty()
                .withMessage('Please provide a video ID')
                .isUUID()
                .withMessage('Invalid video ID format'),
            body('content')
                .trim()
                .notEmpty()
                .withMessage('Comment content cannot be empty')
                .isLength({ max: 1000 })
                .withMessage('Comment content cannot exceed 1000 characters')
        ];
    }

    static videoIdParam(): ValidationChain[] {
        return [
            param('videoId')
                .isUUID()
                .withMessage('Invalid video ID format')
        ];
    }

    static commentIdParam(): ValidationChain[] {
        return [
            param('id')
                .isUUID()
                .withMessage('Invalid comment ID format')
        ];
    }
}


