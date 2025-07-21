import { Request, Response } from 'express';
import { CreateVideoUseCase, UpdateVideoUseCase, DeleteVideoUseCase, GetVideosByCustomerUseCase } from '@/application/use-cases/video/index';
import { AuthenticatedRequest } from '@/presentation/middleware/AuthMiddleware';

export class VideoController {
    constructor(
        private createVideoUseCase: CreateVideoUseCase,
        private updateVideoUseCase: UpdateVideoUseCase,
        private deleteVideoUseCase: DeleteVideoUseCase,
        private getVideosByCustomerUseCase: GetVideosByCustomerUseCase
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

    async getVideosByCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
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

            const videos = await this.getVideosByCustomerUseCase.execute(request);

            res.status(200).json({
                success: true,
                message: 'Videos retrieved successfully',
                data: videos
            });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve videos'
            });
        }
    }
}