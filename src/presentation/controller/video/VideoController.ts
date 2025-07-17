import { Request, Response } from 'express';
import { CreateVideoUseCase } from '@/application/use-cases/video/CreateVideoUseCase';
import { AuthenticatedRequest } from '@/presentation/middleware/AuthMiddleware';

export class VideoController {
    constructor(
        private createVideoUseCase: CreateVideoUseCase
    ) {}

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
}