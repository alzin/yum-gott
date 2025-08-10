import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { CreateCommentUseCase } from '@/application/use-cases/comment/CreateCommentUseCase';
import { GetVideoCommentsUseCase } from '@/application/use-cases/comment/GetVideoCommentsUseCase';
import { DeleteCommentUseCase } from '@/application/use-cases/comment/DeleteCommentUseCase';

export class CommentController {
    constructor(
        private createCommentUseCase: CreateCommentUseCase,
        private getVideoCommentsUseCase: GetVideoCommentsUseCase,
        private deleteCommentUseCase: DeleteCommentUseCase
    ) { }

    async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { videoId, content } = req.body;
            const userId = req.user!.userId;
            const userType = req.user!.userType;

            const result = await this.createCommentUseCase.execute({
                videoId,
                userId,
                userType,
                content
            });
            if (!result.success) {
                if (result.error === 'Video not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Video not found'
                    });
                    return;
                }
                res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to create comment'
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Comment created successfully',
                data: result.comment
            });
        } catch (error) {
            console.error('Error creating comment:', error);

            if (error instanceof Error) {
                if (error.message === 'Video not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Video not found'
                    });
                    return;
                }
                if (error.message === 'Invalid comment content') {
                    res.status(400).json({
                        success: false,
                        message: error.message
                    });
                    return;
                }
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getVideoComments(req: Request, res: Response): Promise<void> {
        try {
            const { videoId } = req.params;

            const result = await this.getVideoCommentsUseCase.execute({
                videoId
            });

            res.status(200).json({
                success: true,
                message: 'Comments retrieved successfully',
                data: result.comments
            });
        } catch (error) {
            console.error('Error getting video comments:', error);

            if (error instanceof Error) {
                if (error.message === 'Video not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Video not found'
                    });
                    return;
                }
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userType = req.user!.userType;

            const result = await this.deleteCommentUseCase.execute({
                commentId: id,
                userId,
                userType
            });

            res.status(200).json({
                success: true,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting comment:', error);

            if (error instanceof Error) {
                if (error.message === 'Comment not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Comment not found'
                    });
                    return;
                }
                if (error.message === 'Unauthorized to delete this comment') {
                    res.status(403).json({
                        success: false,
                        message: 'You can only delete your own comments'
                    });
                    return;
                }
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
