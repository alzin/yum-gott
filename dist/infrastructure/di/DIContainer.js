"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
const DataBaseConnection_1 = require("../database/DataBaseConnection");
const UserRepository_1 = require("../repositories/UserRepository");
const AuthRepository_1 = require("../repositories/AuthRepository");
const PasswordHasher_1 = require("../services/PasswordHasher");
const RegisterCustomerUseCase_1 = require("@/application/use-cases/auth/RegisterCustomerUseCase");
const RegisterResturantOwnerUseCases_1 = require("@/application/use-cases/auth/RegisterResturantOwnerUseCases");
const LoginUseCase_1 = require("@/application/use-cases/auth/LoginUseCase");
const AuthController_1 = require("@/presentation/controller/AuthController");
const AuthMiddleware_1 = require("@/presentation/middleware/AuthMiddleware");
class DIContainer {
    constructor() {
        this.dependencies = new Map();
        this.factories = new Map();
        this.singletons = new Set();
        this.registerDependencies();
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
    // Method to reset instance (useful for testing)
    static resetInstance() {
        DIContainer.instance = undefined;
    }
    registerDependencies() {
        // Infrastructure - Register as singletons
        this.registerSingleton('databaseConnection', () => DataBaseConnection_1.DatabaseConnection.getInstance());
        this.registerSingleton('userRepository', () => new UserRepository_1.UserRepository(this.resolve('databaseConnection')));
        this.registerSingleton('authRepository', () => new AuthRepository_1.AuthRepository());
        this.registerSingleton('passwordHasher', () => new PasswordHasher_1.PasswordHasher());
        // Use Cases - Register as transients (new instance each time)
        this.registerTransient('registerCustomerUseCase', () => new RegisterCustomerUseCase_1.RegisterCustomerUseCase(this.resolve('userRepository'), this.resolve('passwordHasher')));
        this.registerTransient('registerRestaurantOwnerUseCase', () => new RegisterResturantOwnerUseCases_1.RegisterRestaurantOwnerUseCase(this.resolve('userRepository'), this.resolve('passwordHasher')));
        this.registerTransient('loginUseCase', () => new LoginUseCase_1.LoginUseCase(this.resolve('userRepository'), this.resolve('authRepository'), this.resolve('passwordHasher')));
        // Controllers - Register as singletons
        this.registerSingleton('authController', () => new AuthController_1.AuthController(this.resolve('registerCustomerUseCase'), this.resolve('registerRestaurantOwnerUseCase'), this.resolve('loginUseCase')));
        // Middleware - Register as singletons
        this.registerSingleton('authMiddleware', () => new AuthMiddleware_1.AuthMiddleware(this.resolve('authRepository')));
    }
    /**
     * Register a dependency as a singleton (single instance)
     */
    registerSingleton(key, factory) {
        this.factories.set(key, factory);
        this.singletons.add(key);
    }
    /**
     * Register a dependency as transient (new instance each time)
     */
    registerTransient(key, factory) {
        this.factories.set(key, factory);
    }
    /**
     * Resolve a dependency by key
     */
    resolve(key) {
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
        }
        catch (error) {
            throw new Error(`Failed to resolve dependency '${key}': ${error}`);
        }
    }
    /**
     * Check if a dependency is registered
     */
    isRegistered(key) {
        return this.factories.has(key);
    }
    /**
     * Get all registered dependency keys
     */
    getRegisteredKeys() {
        return Array.from(this.factories.keys());
    }
    // Convenience getters for backward compatibility
    get databaseConnection() {
        return this.resolve('databaseConnection');
    }
    get userRepository() {
        return this.resolve('userRepository');
    }
    get authRepository() {
        return this.resolve('authRepository');
    }
    get passwordHasher() {
        return this.resolve('passwordHasher');
    }
    get registerCustomerUseCase() {
        return this.resolve('registerCustomerUseCase');
    }
    get registerRestaurantOwnerUseCase() {
        return this.resolve('registerRestaurantOwnerUseCase');
    }
    get loginUseCase() {
        return this.resolve('loginUseCase');
    }
    get authController() {
        return this.resolve('authController');
    }
    get authMiddleware() {
        return this.resolve('authMiddleware');
    }
}
exports.DIContainer = DIContainer;
