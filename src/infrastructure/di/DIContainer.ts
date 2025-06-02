
import { DatabaseConnection } from '../database/DataBaseConnection';
import { UserRepository } from '../repositories/UserRepository';
import { AuthRepository } from '../repositories/AuthRepository';
import { PasswordHasher } from '../services/PasswordHasher';

import { RegisterCustomerUseCase } from '@/application/use-cases/auth/RegisterCustomerUseCase';
import { RegisterRestaurantOwnerUseCase } from '@/application/use-cases/auth/RegisterResturantOwnerUseCases';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';

import { AuthController } from '@/presentation/controller/AuthController';
import { AuthMiddleware } from '@/presentation/middleware/AuthMiddleware';

// Types for dependency resolution
type DependencyKey = keyof DIContainer;
type DependencyFactory<T = any> = () => T;

export class DIContainer {
  private static instance: DIContainer;
  private dependencies: Map<string, any> = new Map();
  private factories: Map<string, DependencyFactory> = new Map();
  private singletons: Set<string> = new Set();

  private constructor() {
    this.registerDependencies();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Method to reset instance (useful for testing)
  public static resetInstance(): void {
    DIContainer.instance = undefined as any;
  }

  private registerDependencies(): void {
    // Infrastructure - Register as singletons
    this.registerSingleton('databaseConnection', () => DatabaseConnection.getInstance());
    
    this.registerSingleton('userRepository', () => 
      new UserRepository(this.resolve('databaseConnection'))
    );
    
    this.registerSingleton('authRepository', () => new AuthRepository());
    this.registerSingleton('passwordHasher', () => new PasswordHasher());

    // Use Cases - Register as transients (new instance each time)
    this.registerTransient('registerCustomerUseCase', () =>
      new RegisterCustomerUseCase(
        this.resolve('userRepository'),
        this.resolve('passwordHasher')
      )
    );

    this.registerTransient('registerRestaurantOwnerUseCase', () =>
      new RegisterRestaurantOwnerUseCase(
        this.resolve('userRepository'),
        this.resolve('passwordHasher')
      )
    );

    this.registerTransient('loginUseCase', () =>
      new LoginUseCase(
        this.resolve('userRepository'),
        this.resolve('authRepository'),
        this.resolve('passwordHasher')
      )
    );

    // Controllers - Register as singletons
    this.registerSingleton('authController', () =>
      new AuthController(
        this.resolve('registerCustomerUseCase'),
        this.resolve('registerRestaurantOwnerUseCase'),
        this.resolve('loginUseCase')
      )
    );

    // Middleware - Register as singletons
    this.registerSingleton('authMiddleware', () =>
      new AuthMiddleware(this.resolve('authRepository'))
    );
  }

  /**
   * Register a dependency as a singleton (single instance)
   */
  private registerSingleton<T>(key: string, factory: DependencyFactory<T>): void {
    this.factories.set(key, factory);
    this.singletons.add(key);
  }

  /**
   * Register a dependency as transient (new instance each time)
   */
  private registerTransient<T>(key: string, factory: DependencyFactory<T>): void {
    this.factories.set(key, factory);
  }

  /**
   * Resolve a dependency by key
   */
  public resolve<T>(key: string): T {
    // Check if it's a singleton and already created
    if (this.singletons.has(key) && this.dependencies.has(key)) {
      return this.dependencies.get(key);
    }

    // Get the factory
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Dependency '${key}' not registered`);
    }

    try {
      const instance = factory();
      
      // Store singleton instances
      if (this.singletons.has(key)) {
        this.dependencies.set(key, instance);
      }
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to resolve dependency '${key}': ${error}`);
    }
  }

  /**
   * Check if a dependency is registered
   */
  public isRegistered(key: string): boolean {
    return this.factories.has(key);
  }

  /**
   * Get all registered dependency keys
   */
  public getRegisteredKeys(): string[] {
    return Array.from(this.factories.keys());
  }

  // Convenience getters for backward compatibility
  public get databaseConnection(): DatabaseConnection {
    return this.resolve('databaseConnection');
  }

  public get userRepository(): UserRepository {
    return this.resolve('userRepository');
  }

  public get authRepository(): AuthRepository {
    return this.resolve('authRepository');
  }

  public get passwordHasher(): PasswordHasher {
    return this.resolve('passwordHasher');
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