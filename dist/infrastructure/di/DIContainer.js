"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
const DataBaseConnection_1 = require("../database/DataBaseConnection");
const CustomerRepository_1 = require("../repositories/CustomerRepository");
const RestaurantOwnerRepository_1 = require("../repositories/RestaurantOwnerRepository");
const AuthRepository_1 = require("../repositories/AuthRepository");
const PasswordHasher_1 = require("../services/PasswordHasher");
const EmailService_1 = require("../services/EmailService");
const RegisterCustomerUseCase_1 = require("../../application/use-cases/auth/RegisterCustomerUseCase");
const RegisterResturantOwnerUseCases_1 = require("../../application/use-cases/auth/RegisterResturantOwnerUseCases");
const LoginUseCase_1 = require("../../application/use-cases/auth/LoginUseCase");
const AuthController_1 = require("../../presentation/controller/AuthController");
const AuthMiddleware_1 = require("../../presentation/middleware/AuthMiddleware");
class DIContainer {
    constructor() {
        this.dependencies = new Map();
        this.factories = new Map();
        this.singletons = new Set();
        console.log('DIContainer: Initializing dependency injection');
        this.registerDependencies();
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
    static resetInstance() {
        console.log('DIContainer: Resetting instance');
        DIContainer.instance = undefined;
    }
    registerDependencies() {
        // Infrastructure - Register as singletons
        this.registerSingleton('databaseConnection', () => {
            console.log('DIContainer: Registering databaseConnection');
            return DataBaseConnection_1.DatabaseConnection.getInstance();
        });
        this.registerSingleton('customerRepository', () => {
            console.log('DIContainer: Registering customerRepository');
            return new CustomerRepository_1.CustomerRepository(this.resolve('databaseConnection'));
        });
        this.registerSingleton('restaurantOwnerRepository', () => {
            console.log('DIContainer: Registering restaurantOwnerRepository');
            return new RestaurantOwnerRepository_1.RestaurantOwnerRepository(this.resolve('databaseConnection'));
        });
        this.registerSingleton('authRepository', () => {
            console.log('DIContainer: Registering authRepository');
            return new AuthRepository_1.AuthRepository();
        });
        this.registerSingleton('passwordHasher', () => {
            console.log('DIContainer: Registering passwordHasher');
            return new PasswordHasher_1.PasswordHasher();
        });
        this.registerSingleton('emailService', () => {
            console.log('DIContainer: Registering emailService');
            return new EmailService_1.EmailService();
        });
        // Use Cases - Register as transients
        this.registerTransient('registerCustomerUseCase', () => {
            console.log('DIContainer: Registering registerCustomerUseCase');
            return new RegisterCustomerUseCase_1.RegisterCustomerUseCase(this.resolve('customerRepository'), this.resolve('passwordHasher'), this.resolve('emailService'));
        });
        this.registerTransient('registerRestaurantOwnerUseCase', () => {
            console.log('DIContainer: Registering registerRestaurantOwnerUseCase');
            return new RegisterResturantOwnerUseCases_1.RegisterRestaurantOwnerUseCase(this.resolve('restaurantOwnerRepository'), this.resolve('passwordHasher'), this.resolve('emailService'));
        });
        this.registerTransient('loginUseCase', () => {
            console.log('DIContainer: Registering loginUseCase');
            return new LoginUseCase_1.LoginUseCase(this.resolve('customerRepository'), this.resolve('restaurantOwnerRepository'), this.resolve('authRepository'), this.resolve('passwordHasher'));
        });
        // Controllers - Register as singletons
        this.registerSingleton('authController', () => {
            console.log('DIContainer: Registering authController');
            return new AuthController_1.AuthController(this.resolve('registerCustomerUseCase'), this.resolve('registerRestaurantOwnerUseCase'), this.resolve('loginUseCase'));
        });
        // Middleware - Register as singletons
        this.registerSingleton('authMiddleware', () => {
            console.log('DIContainer: Registering authMiddleware');
            return new AuthMiddleware_1.AuthMiddleware(this.resolve('authRepository'));
        });
    }
    registerSingleton(key, factory) {
        this.factories.set(key, factory);
        this.singletons.add(key);
    }
    registerTransient(key, factory) {
        this.factories.set(key, factory);
    }
    resolve(key) {
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
        }
        catch (error) {
            throw new Error(`Failed to resolve dependency '${key}': ${error}`);
        }
    }
    isRegistered(key) {
        return this.factories.has(key);
    }
    getRegisteredKeys() {
        return Array.from(this.factories.keys());
    }
    get databaseConnection() {
        return this.resolve('databaseConnection');
    }
    get customerRepository() {
        return this.resolve('customerRepository');
    }
    get restaurantOwnerRepository() {
        return this.resolve('restaurantOwnerRepository');
    }
    get authRepository() {
        return this.resolve('authRepository');
    }
    get passwordHasher() {
        return this.resolve('passwordHasher');
    }
    get emailService() {
        return this.resolve('emailService');
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
