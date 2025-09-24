import { DatabaseConnection } from '../database/DataBaseConnection';
import { CustomerRepository, RestaurantOwnerRepository, AuthRepository, ProductRepository } from '../repositories/index';
import { PasswordHasher, EmailService, FileStorageService } from '../services/index';
import {
  RegisterCustomerUseCase,
  RegisterRestaurantOwnerUseCase,
  UploadProfileImageUseCase,
  CustomerLoginUseCase,
  RestaurantOwnerLoginUseCase,
  UpdateRestaurantLocationUseCase,
  // GetRestaurantOwnerProfileUseCase,
  LogoutUseCase,
  CleanupUnverifiedAccountsUseCase
} from '@/application/use-cases/auth/index';
import { AuthController } from '@/presentation/controller/AuthController';
import { AuthMiddleware } from '@/presentation/middleware/AuthMiddleware';
import { CreateProductUseCase, GetProductUseCase, GetProductsByRestaurantUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/product';
import { CategoryRepository } from '../repositories';
import { CreateCategoryUseCase, GetCategoriesByRestaurantUseCase } from '@/application/use-cases/category';
// import { IProductOptionRepository, IProductOptionValueRepository, IRestaurantOwnerRepository, IProductRepository } from '@/domain/repositories/index';
import { ProductOptionRepository, ProductOptionValueRepository } from '@/infrastructure/repositories/index';
import { CreateProductOptionUseCase, CreateProductOptionValueUseCase, GetProductOptionsUseCase, DeleteProductOptionUseCase, DeleteProductOptionValueUseCase } from '@/application/use-cases/product-option/index';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/RefreshTokenUseCase';
import { registerRepositories } from './registrations/registerRepositories';
import { registerServices } from './registrations/registerServices';
import { registerUseCases } from './registrations/registerUseCases';

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
      // Register product-related dependencies
      DIContainer.instance.registerSingleton('IProductRepository', () => new ProductRepository(DIContainer.instance.databaseConnection.getPool()));
      DIContainer.instance.registerTransient('createProductUseCase', () => new CreateProductUseCase(
        DIContainer.instance.resolve('IProductRepository'),
        DIContainer.instance.resolve('restaurantOwnerRepository'),
        DIContainer.instance.resolve('fileStorageService'),
        DIContainer.instance.resolve('ICategoryRepository'),
        DIContainer.instance.resolve('createCategoryUseCase'),
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('productOptionValueRepository')
      ));
      DIContainer.instance.registerTransient('getProductUseCase', () => new GetProductUseCase(
        DIContainer.instance.resolve('IProductRepository')
      ));
      DIContainer.instance.registerTransient('getProductsByRestaurantUseCase', () => new GetProductsByRestaurantUseCase(
        DIContainer.instance.resolve('IProductRepository'),
        DIContainer.instance.resolve('restaurantOwnerRepository')
      ));
      DIContainer.instance.registerTransient('updateProductUseCase', () => new UpdateProductUseCase(
        DIContainer.instance.resolve('IProductRepository'),
        DIContainer.instance.resolve('fileStorageService'),
        DIContainer.instance.resolve('ICategoryRepository'),
        DIContainer.instance.resolve('createCategoryUseCase'),
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('productOptionValueRepository')
      ));
      DIContainer.instance.registerTransient('deleteProductUseCase', () => new DeleteProductUseCase(
        DIContainer.instance.resolve('IProductRepository'),
        DIContainer.instance.resolve('fileStorageService')
      ));

      // Register category-related dependencies
      DIContainer.instance.registerSingleton('ICategoryRepository', () => new CategoryRepository(DIContainer.instance.databaseConnection));
      DIContainer.instance.registerTransient('createCategoryUseCase', () => new CreateCategoryUseCase(
        DIContainer.instance.resolve('ICategoryRepository'),
        DIContainer.instance.resolve('restaurantOwnerRepository')
      ));
      DIContainer.instance.registerTransient('getCategoriesByRestaurantUseCase', () => new GetCategoriesByRestaurantUseCase(
        DIContainer.instance.resolve('ICategoryRepository'),
        DIContainer.instance.resolve('restaurantOwnerRepository')
      ));

      // Register product option repositories and use cases
      DIContainer.instance.registerSingleton('productOptionRepository', () => new ProductOptionRepository(DIContainer.instance.databaseConnection));
      DIContainer.instance.registerSingleton('productOptionValueRepository', () => new ProductOptionValueRepository(DIContainer.instance.databaseConnection));

      DIContainer.instance.registerTransient('createProductOptionUseCase', () => new CreateProductOptionUseCase(
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('IProductRepository')
      ));
      DIContainer.instance.registerTransient('createProductOptionValueUseCase', () => new CreateProductOptionValueUseCase(
        DIContainer.instance.resolve('productOptionValueRepository'),
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('IProductRepository')
      ));
      DIContainer.instance.registerTransient('getProductOptionsUseCase', () => new GetProductOptionsUseCase(
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('productOptionValueRepository'),
        DIContainer.instance.resolve('IProductRepository')
      ));
      DIContainer.instance.registerTransient('deleteProductOptionUseCase', () => new DeleteProductOptionUseCase(
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('productOptionValueRepository'),
        DIContainer.instance.resolve('IProductRepository'),
        // DIContainer.instance.resolve('restaurantOwnerRepository')
      ));
      DIContainer.instance.registerTransient('deleteProductOptionValueUseCase', () => new DeleteProductOptionValueUseCase(
        DIContainer.instance.resolve('productOptionValueRepository'),
        DIContainer.instance.resolve('productOptionRepository'),
        DIContainer.instance.resolve('IProductRepository')
      ));

      // Register logout use case
      DIContainer.instance.registerTransient('logoutUseCase', () => {
        console.log('DIContainer: Registering logoutUseCase');
        return new LogoutUseCase(DIContainer.instance.resolve('authRepository'));
      });

      // Register refresh token use case
      DIContainer.instance.registerTransient('refreshTokenUseCase', () => {
        console.log('DIContainer: Registering refreshTokenUseCase');
        return new RefreshTokenUseCase(DIContainer.instance.resolve('authRepository'));
      });

      DIContainer.instance.registerSingleton(
        'IProductOptionRepository',
        () => new ProductOptionRepository(DIContainer.instance.databaseConnection)
      );

      // Register cleanup unverified accounts use case
      DIContainer.instance.registerSingleton('cleanupUnverifiedAccountsUseCase', () => {
        return new CleanupUnverifiedAccountsUseCase(
          DIContainer.instance.resolve('customerRepository'),
          DIContainer.instance.resolve('restaurantOwnerRepository')
        );
      });
    }
    return DIContainer.instance;
  }

  public static resetInstance(): void {
    console.log('DIContainer: Resetting instance');
    DIContainer.instance = undefined as any;
  }

  private registerDependencies(): void {
    registerRepositories(this);
    registerServices(this);
    registerUseCases(this);
  }

  public registerSingleton<T>(key: string, factory: DependencyFactory<T>): void {
    this.factories.set(key, factory);
    this.singletons.add(key);
  }


  public registerTransient<T>(key: string, factory: DependencyFactory<T>): void {
    this.factories.set(key, factory);
    this.singletons.delete(key);
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

  public get fileStorageService(): FileStorageService {
    return this.resolve('fileStorageService');
  }

  public get registerCustomerUseCase(): RegisterCustomerUseCase {
    return this.resolve('registerCustomerUseCase');
  }

  public get registerRestaurantOwnerUseCase(): RegisterRestaurantOwnerUseCase {
    return this.resolve('registerRestaurantOwnerUseCase');
  }

  public get customerLoginUseCase(): CustomerLoginUseCase {
    return this.resolve('customerLoginUseCase');
  }

  public get restaurantOwnerLoginUseCase(): RestaurantOwnerLoginUseCase {
    return this.resolve('restaurantOwnerLoginUseCase');
  }

  public get uploadProfileImageUseCase(): UploadProfileImageUseCase {
    return this.resolve('uploadProfileImageUseCase');
  }

  public get updateRestaurantLocationUseCase(): UpdateRestaurantLocationUseCase {
    return this.resolve('updateRestaurantLocationUseCase');
  }

  public get authController(): AuthController {
    return this.resolve('authController');
  }

  public get authMiddleware(): AuthMiddleware {
    return this.resolve('authMiddleware');
  }

  public get logoutUseCase(): LogoutUseCase {
    return this.resolve('logoutUseCase');
  }

  public get cleanupUnverifiedAccountsUseCase(): CleanupUnverifiedAccountsUseCase {
    return this.resolve('cleanupUnverifiedAccountsUseCase');
  }
}
