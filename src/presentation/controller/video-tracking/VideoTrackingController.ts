import { Request, Response } from 'express';
import { validate as isUUID } from 'uuid';
import { IVideoFeedUseCase } from '../../../application/interface/IVideoFeedUseCase';
import { IUpdateVideoPositionUseCase } from '../../../application/interface/IUpdateVideoPositionUseCase';

export class VideoTrackingController {
    constructor(
        private videoFeedUseCase: IVideoFeedUseCase,
        private updateVideoPositionUseCase: IUpdateVideoPositionUseCase
    ) { }

    async getVideoFeed(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, limit = 10, cursor } = req.query;

            if (!user_id || typeof user_id !== 'string') {
                res.status(400).json({ error: 'user_id is required' });
                return;
            }

            if (typeof user_id === 'string' && !isUUID(user_id)) {
                res.status(400).json({ error: 'user_id must be a valid UUID' });
                return;
            }

            // Ensure limitNum is always a number
            let limitNum: number = 10;
            if (typeof limit === 'string') {
                limitNum = parseInt(limit, 10);
            } else if (typeof limit === 'number') {
                limitNum = limit;
            }
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
                res.status(400).json({ error: 'limit must be between 1 and 50' });
                return;
            }

            if (cursor !== undefined) {
                if (typeof cursor !== 'string' || (cursor && !isUUID(cursor))) {
                    res.status(400).json({ error: 'cursor must be a UUID (use the previous next_cursor value)' });
                    return;
                }
            }

            const result = await this.videoFeedUseCase.execute({
                userId: user_id,
                limit: limitNum,
                cursor: typeof cursor === 'string' ? cursor : undefined
            });

            res.status(200).json({
                videos: result.videos,
                next_cursor: result.nextCursor,
                has_more: result.hasMore
            });
        } catch (error) {
            console.error('Error getting video feed:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateVideoPosition(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, last_video_id } = req.body;

            if (!user_id || typeof user_id !== 'string') {
                res.status(400).json({ error: 'user_id is required' });
                return;
            }

            if (!last_video_id || typeof last_video_id !== 'string') {
                res.status(400).json({ error: 'last_video_id is required' });
                return;
            }

            if (!isUUID(user_id)) {
                res.status(400).json({ error: 'user_id must be a valid UUID' });
                return;
            }

            if (!isUUID(last_video_id)) {
                res.status(400).json({ error: 'last_video_id must be a valid UUID' });
                return;
            }

            const result = await this.updateVideoPositionUseCase.execute({
                userId: user_id,
                lastVideoId: last_video_id
            });

            res.status(200).json({
                success: result.success,
                message: result.message
            });
        } catch (error) {
            console.error('Error updating video position:', error);

            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                if (error.message === 'Video not found') {
                    res.status(404).json({ error: 'Video not found' });
                    return;
                }
            }

            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 