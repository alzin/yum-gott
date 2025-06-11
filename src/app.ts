import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from "swagger-ui-express";
import YAML from 'yamljs';
import morgan from 'morgan';
import { DIContainer } from './infrastructure/di/DIContainer';
import { AuthRouter } from './presentation/router/AuthRouter';
import path from "path";

export class App {
  private app: Application;
  private diContainer: DIContainer;
  private publicPath: string;

  constructor() {
    const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));
    this.app = express();

    this.publicPath = path.join(__dirname, 'public');

    // serve static files - يجب أن يكون أولاً
    this.app.use(express.static(this.publicPath));

    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    this.diContainer = DIContainer.getInstance();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());

    this.app.use(cors({
      origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://yum-gott.onrender.com', "http://127.0.0.1:5500"];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Set-Cookie'],
    }));

    this.app.use(morgan('combined'));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // يمكنك إزالة هذا إذا تريد الاعتماد على express.static فقط
    this.app.get('/index', (req: Request, res: Response) => {
      res.sendFile(path.join(this.publicPath, 'index.html'));
    });

    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    const authRouter = new AuthRouter(this.diContainer.authController);
    this.app.use('/api/auth', authRouter.getRouter());

    // 404 handler
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

  public getApp(): Application {
    return this.app;
  }

  public async start(port: number = 3000): Promise<void> {
    try {
      this.app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
        console.log(`📱 Health check: http://localhost:${port}/health`);
        console.log(`🔐 Auth API: http://localhost:${port}/api/auth`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}
