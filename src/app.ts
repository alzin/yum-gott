import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from "swagger-ui-express";
import YAML from 'yamljs';
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import { DIContainer } from './infrastructure/di/DIContainer';
import { AuthRouter, CategoryRouter, OpeningHoursRouter, ProductRouter, VideoRouter, VideoTrackingRouter, CommentRouter, LikeRouter, PayGateRouter } from './presentation/router/index';
import path from "path";
// import { CleanupUnverifiedAccounts } from './infrastructure/services/CleanupUnverifiedAccounts';

export class App {
  private app: Application;
  // private diContainer: DIContainer;
  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cookieParser());

    this.app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      exposedHeaders: ['Set-Cookie']
    }));

    this.app.use(morgan('combined'));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  constructor() {
    const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));
    this.app = express();



    const swaggerOptions = {
      swaggerOptions: {
        withCredentials: true,
        requestInterceptor: (req: any) => {
          req.credentials = 'include';
          return req;
        },
        persistAuthorization: true,
        displayOperationId: false,
        tryItOutEnabled: true
      }

    };

    this.app.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, swaggerOptions)
    );


    // this.diContainer = DIContainer.getInstance();
    // const cleanupService = new CleanupUnverifiedAccounts(this.diContainer.cleanupUnverifiedAccountsUseCase);
    // cleanupService.startScheduledJobs();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }



  private setupRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    const authRouter = new AuthRouter();
    this.app.use('/api/auth', authRouter.getRouter());

    const categoryRouter = new CategoryRouter();
    this.app.use('/api/categories', categoryRouter.getRouter());

    const productRouter = new ProductRouter();
    this.app.use('/api/products', productRouter.getRouter());

    const openingHoursRouter = new OpeningHoursRouter();
    this.app.use('/api/opening-hours', openingHoursRouter.getRouter());


    const videoRouter = new VideoRouter();
    this.app.use('/api/videos', videoRouter.getRouter())

    const videoTrackingRouter = new VideoTrackingRouter(
      DIContainer.getInstance().resolve('getVideoFeedUseCase'),
      DIContainer.getInstance().resolve('updateVideoPositionUseCase')
    );
    this.app.use('/api/videos', videoTrackingRouter.getRouter());

    const commentRouter = new CommentRouter();
    this.app.use('/api/comments', commentRouter.getRouter());

    const likeRouter = new LikeRouter();
    this.app.use('/api/likes', likeRouter.getRouter());

    const payGateRouter = new PayGateRouter();
    this.app.use('/api/payGate', payGateRouter.getRouter());

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Global Error Handler:', error);

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    });
  }

  private getLocalIpAddress(): string {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    } 
    return 'localhost';
  }


  public getApp(): Application {
    return this.app;
  } 

  public async start(port: number = 3000): Promise<void> {
    try {
      this.app.listen(port, '0.0.0.0', () => {
        const env = process.env.NODE_ENV || 'development';
        console.log(`🚀 Server is running (env: ${env} - server) on http://localhost:${port}`);
        console.log(`🌐 Network URL: http://${this.getLocalIpAddress()}:${port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }


}