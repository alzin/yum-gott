import { Router } from 'express';
import { VideoTrackingController } from '../controller/video-tracking/VideoTrackingController';
import { IVideoFeedUseCase } from '../../application/interface/IVideoFeedUseCase';
import { IUpdateVideoPositionUseCase } from '../../application/interface/IUpdateVideoPositionUseCase';

export class VideoTrackingRouter {
    private router: Router;
    private controller: VideoTrackingController;

    constructor(
        videoFeedUseCase: IVideoFeedUseCase,
        updateVideoPositionUseCase: IUpdateVideoPositionUseCase
    ) {
        this.router = Router();
        this.controller = new VideoTrackingController(videoFeedUseCase, updateVideoPositionUseCase);
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get('/feed', (req, res) => this.controller.getVideoFeed(req, res));

        this.router.post('/update-position', (req, res) => this.controller.updateVideoPosition(req, res));
    }

    public getRouter(): Router {
        return this.router;
    }
} 