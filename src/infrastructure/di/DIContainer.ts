import { DatabaseConnection } from '../database/DataBaseConnection';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { RestaurantOwnerRepository } from '../repositories/RestaurantOwnerRepository';
import { AuthRepository } from '../repositories/AuthRepository';
import { PasswordHasher } from '../services/PasswordHasher';
import { EmailService } from '../services/EmailService';
import { RegisterCustomerUseCase } from '@/application/use-cases/auth/RegisterCustomerUseCase';
import { RegisterRestaurantOwnerUseCase } from '@/application/use-cases/auth/RegisterResturantOwnerUseCases';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { AuthController } from '@/presentation/controller/AuthController';
import { AuthMiddleware } from '@/presentation/middleware/AuthMiddleware';
type DependencyKey = keyof DIContainer;
type DependencyFactory<T = any> = () => T;

export class DIContainer {
    private static instance: DIContainer;
    private dependencies: Map<string, any> = new Map();
    private factories: Map<string, DependencyFactory> = new Map();
    private singletons: Set<string> = new Set();

    private constructor() {
        console.log('DIContainer: Initializing dependency injection');
        this.registerDependencies();
    }

    public static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    public static resetInstance(): void {
        console.log('DIContainer: Resetting instance');
        DIContainer.instance = undefined as any;
    }

    private registerDependencies(): void {
        // Infrastructure - Register as singletons
        this.registerSingleton('databaseConnection', () => {
            console.log('DIContainer: Registering databaseConnection');
            return DatabaseConnection.getInstance();
        });
        
        this.registerSingleton('customerRepository', () => {
            console.log('DIContainer: Registering customerRepository');
            return new CustomerRepository(this.resolve('databaseConnection'));
        });
        
        this.registerSingleton('restaurantOwnerRepository', () => {
            console.log('DIContainer: Registering restaurantOwnerRepository');
            return new RestaurantOwnerRepository(this.resolve('databaseConnection'));
        });
        
        this.registerSingleton('authRepository', () => {
            console.log('DIContainer: Registering authRepository');
            return new AuthRepository();
        });
        this.registerSingleton('passwordHasher', () => {
            console.log('DIContainer: Registering passwordHasher');
            return new PasswordHasher();
        });
        
        this.registerSingleton('emailService', () => {
            console.log('DIContainer: Registering emailService');
            return new EmailService();
        });

        // Use Cases - Register as transients
        this.registerTransient('registerCustomerUseCase', () => {
            console.log('DIContainer: Registering registerCustomerUseCase');
            return new RegisterCustomerUseCase(
                this.resolve('customerRepository'),
                this.resolve('passwordHasher'),
                this.resolve('emailService')
            );
        });

        this.registerTransient('registerRestaurantOwnerUseCase', () => {
            console.log('DIContainer: Registering registerRestaurantOwnerUseCase');
            return new RegisterRestaurantOwnerUseCase(
                this.resolve('restaurantOwnerRepository'),
                this.resolve('passwordHasher'),
                this.resolve('emailService')
            );
        });

        this.registerTransient('loginUseCase', () => {
            console.log('DIContainer: Registering loginUseCase');
            return new LoginUseCase(
                this.resolve('customerRepository'),
                this.resolve('restaurantOwnerRepository'),
                this.resolve('authRepository'),
                this.resolve('passwordHasher')
            );
        });

        // Controllers - Register as singletons
        this.registerSingleton('authController', () => {
            console.log('DIContainer: Registering authController');
            return new AuthController(
                this.resolve('registerCustomerUseCase'),
                this.resolve('registerRestaurantOwnerUseCase'),
                this.resolve('loginUseCase')
            );
        });

        // Middleware - Register as singletons
        this.registerSingleton('authMiddleware', () => {
            console.log('DIContainer: Registering authMiddleware');
            return new AuthMiddleware(this.resolve('authRepository'));
        });
    }

    private registerSingleton<T>(key: string, factory: DependencyFactory<T>): void {
        this.factories.set(key, factory);
        this.singletons.add(key);
    }

    private registerTransient<T>(key: string, factory: DependencyFactory<T>): void {
        this.factories.set(key, factory);
    }

    public resolve<T>(key: string): T {
        if (this.singletons.has(key) && this.dependencies.has(key)) {
            console.log('DIContainer: Resolving cached singleton', key);
            return this.dependencies.get(key);
        }

        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`Dependency '${key}' not registered`);
        }

        try {
            const instance = factory();
            if (this.singletons.has(key)) {
                this.dependencies.set(key, instance);
                console.log('DIContainer: Cached new singleton', key);
            }
            return instance;
        } catch (error) {
            throw new Error(`Failed to resolve dependency '${key}': ${error}`);
        }
    }

    public isRegistered(key: string): boolean {
        return this.factories.has(key);
    }

    public getRegisteredKeys(): string[] {
        return Array.from(this.factories.keys());
    }

    public get databaseConnection(): DatabaseConnection {
        return this.resolve('databaseConnection');
    }

    public get customerRepository(): CustomerRepository {
        return this.resolve('customerRepository');
    }

    public get restaurantOwnerRepository(): RestaurantOwnerRepository {
        return this.resolve('restaurantOwnerRepository');
    }

    public get authRepository(): AuthRepository {
        return this.resolve('authRepository');
    }

    public get passwordHasher(): PasswordHasher {
        return this.resolve('passwordHasher');
    }

    public get emailService(): EmailService {
        return this.resolve('emailService');
    }

    public get registerCustomerUseCase(): RegisterCustomerUseCase {
        return this.resolve('registerCustomerUseCase');
    }

    public get registerRestaurantOwnerUseCase(): RegisterRestaurantOwnerUseCase {
        return this.resolve('registerRestaurantOwnerUseCase');
    }

    public get loginUseCase(): LoginUseCase {
        return this.resolve('loginUseCase');
    }

    public get authController(): AuthController {
        return this.resolve('authController');
    }

    public get authMiddleware(): AuthMiddleware {
        return this.resolve('authMiddleware');
    }
}