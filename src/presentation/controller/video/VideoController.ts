import { Request, Response } from 'express';
import { CreateVideoUseCase, UpdateVideoUseCase, DeleteVideoUseCase, GetAcceptedVideosUseCase, GetCustomerAcceptedVideosUseCase } from '@/application/use-cases/video/index';
import { AuthenticatedRequest } from '@/presentation/middleware/AuthMiddleware';

export class VideoController {
    constructor(
        private createVideoUseCase: CreateVideoUseCase,
        private updateVideoUseCase: UpdateVideoUseCase,
        private deleteVideoUseCase: DeleteVideoUseCase,
        private getAcceptedVideosUseCase: GetAcceptedVideosUseCase,
        private getCustomerAcceptedVideosUseCase: GetCustomerAcceptedVideosUseCase
    ) { }

    async createVideo(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'customer') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only customers can create videos'
                });
                return;
            }

            const request = {
                publicId: req.body.publicId,
                secureUrl: req.body.secureUrl,
                restaurantName: req.body.restaurantName,
                phoneNumber: req.body.phoneNumber,
                network: req.body.network,
                invoiceImage: req.file!
            };

            const result = await this.createVideoUseCase.execute(request, user.userId);

            res.status(201).json({
                success: true,
                message: 'Video created successfully',
                data: result.video
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create video'
            });
        }
    }

    async updateVideos(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'customer') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only customers can update videos'
                });
                return;
            }

            const videoId = req.params.id;
            if (!videoId) {
                res.status(400).json({
                    success: false,
                    message: 'Video ID is required'
                });
                return;
            }

            const request = {
                id: videoId,
                publicId: req.body.publicId,
                secureUrl: req.body.secureUrl,
                restaurantName: req.body.restaurantName,
                phoneNumber: req.body.phoneNumber,
                network: req.body.network,
                invoiceImage: req.file
            };

            const result = await this.updateVideoUseCase.execute(request, user.userId);

            res.status(200).json({
                success: true,
                message: 'Video updated successfully',
                data: result.video
            });
        } catch (error) {
            const statusCode = error instanceof Error &&
                (error.message.includes('not found') || error.message.includes('not authorized'))
                ? 404 : 400;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update video'
            });
        }
    }

    async deleteVideo(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'customer') {
                res.status(403).json({ success: false, message: 'Forbidden: Only customers can delete videos' });
                return;
            }
            const videoId = req.params.id;
            if (!videoId) {
                res.status(400).json({ success: false, message: 'Video ID is required' });
                return;
            }
            await this.deleteVideoUseCase.execute(videoId, user.userId);
            res.status(200).json({ success: true, message: 'Video deleted successfully' });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete video' });
        }
    }

    async getAcceptedVideos(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const cursor = req.query.cursor as string | undefined;
            const cursor_created = req.query.cursor_created as string | undefined;
            const cursor_id = req.query.cursor_id as string | undefined;

            // Validate limit parameter
            if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
                res.status(400).json({
                    success: false,
                    message: 'Limit must be a number between 1 and 100'
                });
                return;
            }

            // Validate cursor_created if provided
            if (cursor_created) {
                const date = new Date(cursor_created);
                if (isNaN(date.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: 'cursor_created must be a valid ISO8601 date string'
                    });
                    return;
                }
            }

            const request = {
                limit,
                cursor,
                cursor_created,
                cursor_id
            };

            const result = await this.getAcceptedVideosUseCase.execute(request);

            res.status(200).json({
                success: true,
                message: 'Videos retrieved successfully',
                data: {
                    videos: result.videos,
                    pagination: {
                        nextCursor: result.nextCursor,
                        hasMore: result.hasMore
                    }
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve accepted videos'
            });
        }
    }

    async getCustomerAcceptedVideos(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'customer') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only customers can access their videos'
                });
                return;
            }

            const request = {
                customerId: user.userId
            };

            const result = await this.getCustomerAcceptedVideosUseCase.execute(request);

            res.status(200).json({
                success: true,
                message: 'Customer accepted videos retrieved successfully',
                data: {
                    videos: result.videos
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve customer accepted videos'
            });
        }
    }


}