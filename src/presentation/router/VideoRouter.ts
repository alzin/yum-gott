import { Router, Response } from 'express';
import { VideoController } from '../controller/video/VideoController';
import { AuthenticatedRequest, SanitizationMiddleware, ValidationMiddleware } from '../middleware';
import { VideoValidators } from '../validators/VideoValidators';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import multer from 'multer';

export class VideoRouter {
    private router: Router;
    private upload: multer.Multer;
    private diContainer: DIContainer;

    constructor() {
        const storage = multer.memoryStorage();
        this.upload = multer({
            storage: storage,
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return cb(new Error('Only JPEG and PNG images are allowed'));
                }
                cb(null, true);
            }
        });
        this.diContainer = DIContainer.getInstance();
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        const authMiddleware = this.diContainer.authMiddleware;
        const controller = new VideoController(
            this.diContainer.resolve('createVideoUseCase'),
            this.diContainer.resolve('updateVideoUseCase')
        );

        this.router.post(
            '/',
            authMiddleware.authenticateUser,
            this.upload.single('invoiceImage'),
            SanitizationMiddleware.allowedFields([
                'publicId',
                'secureUrl',
                'restaurantName',
                'phoneNumber',
                'network'
            ]),
            VideoValidators.createVideo(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.createVideo(req, res)
        );

        this.router.put(
            '/:id',
            authMiddleware.authenticateUser,
            this.upload.single('invoiceImage'),
            SanitizationMiddleware.allowedFields([
                'publicId',
                'secureUrl',
                'restaurantName',
                'phoneNumber',
                'network'
            ]),
            VideoValidators.updateVideo(),
            ValidationMiddleware.handleValidationErrors(),
            (req: AuthenticatedRequest, res: Response) => controller.updateVideos(req, res)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}