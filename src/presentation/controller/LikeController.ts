import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { ToggleVideoLikeUseCase } from '@/application/use-cases/like/ToggleVideoLikeUseCase';
import { GetVideoLikesUseCase } from '@/application/use-cases/like/GetVideoLikesUseCase';

export class LikeController {
    constructor(
        private toggleVideoLikeUseCase: ToggleVideoLikeUseCase,
        private getVideoLikesUseCase: GetVideoLikesUseCase
    ) { }

    async toggleVideoLike(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { videoId } = req.body;
            const userId = req.user!.userId;
            if (req.user!.userType === 'guest') {
                res.status(403).json({ success: false, message: 'Guests cannot like videos' });
                return;
            }
            const userType = req.user!.userType as 'customer' | 'restaurant_owner';

            const result = await this.toggleVideoLikeUseCase.execute({
                videoId,
                userId,
                userType
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
                    message: result.error || 'Failed to toggle like'
                });
                return;
            }

            const message = result.liked ? 'Video liked successfully' : 'Video unliked successfully';

            res.status(200).json({
                success: true,
                message,
                data: {
                    isLiked: !!result.liked,
                    likesCount: result.likesCount ?? 0
                }
            });
        } catch (error) {
            console.error('Error toggling video like:', error);

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

    async getVideoLikes(req: Request, res: Response): Promise<void> {
        try {
            const { videoId } = req.params;

            const result = await this.getVideoLikesUseCase.execute({
                videoId
            });

            res.status(200).json({
                success: true,
                message: 'Video likes retrieved successfully',
                data: {
                    likes: result.likes || [],
                    totalCount: result.likesCount ?? 0
                }
            });
        } catch (error) {
            console.error('Error getting video likes:', error);

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
}
