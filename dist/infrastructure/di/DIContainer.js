"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
const DataBaseConnection_1 = require("../database/DataBaseConnection");
const index_1 = require("../repositories/index");
const index_2 = require("../services/index");
const index_3 = require("../../application/use-cases/auth/index");
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
        this.registerSingleton('databaseConnection', () => {
            console.log('DIContainer: Registering databaseConnection');
            return DataBaseConnection_1.DatabaseConnection.getInstance();
        });
        this.registerSingleton('customerRepository', () => {
            console.log('DIContainer: Registering customerRepository');
            return new index_1.CustomerRepository(this.resolve('databaseConnection'));
        });
        this.registerSingleton('restaurantOwnerRepository', () => {
            console.log('DIContainer: Registering restaurantOwnerRepository');
            return new index_1.RestaurantOwnerRepository(this.resolve('databaseConnection'));
        });
        this.registerSingleton('authRepository', () => {
            console.log('DIContainer: Registering authRepository');
            return new index_1.AuthRepository();
        });
        this.registerSingleton('passwordHasher', () => {
            console.log('DIContainer: Registering passwordHasher');
            return new index_2.PasswordHasher();
        });
        this.registerSingleton('emailService', () => {
            console.log('DIContainer: Registering emailService');
            return new index_2.EmailService();
        });
        this.registerSingleton('fileStorageService', () => {
            console.log('DIContainer: Registering fileStorageService');
            return new index_2.FileStorageService();
        });
        this.registerTransient('registerCustomerUseCase', () => {
            console.log('DIContainer: Registering registerCustomerUseCase');
            return new index_3.RegisterCustomerUseCase(this.resolve('customerRepository'), this.resolve('passwordHasher'), this.resolve('emailService'));
        });
        this.registerTransient('registerRestaurantOwnerUseCase', () => {
            console.log('DIContainer: Registering registerRestaurantOwnerUseCase');
            return new index_3.RegisterRestaurantOwnerUseCase(this.resolve('restaurantOwnerRepository'), this.resolve('passwordHasher'), this.resolve('emailService'));
        });
        this.registerTransient('customerLoginUseCase', () => {
            console.log('DIContainer: Registering customerLoginUseCase');
            return new index_3.CustomerLoginUseCase(this.resolve('customerRepository'), this.resolve('authRepository'), this.resolve('passwordHasher'));
        });
        this.registerTransient('restaurantOwnerLoginUseCase', () => {
            console.log('DIContainer: Registering restaurantOwnerLoginUseCase');
            return new index_3.RestaurantOwnerLoginUseCase(this.resolve('restaurantOwnerRepository'), this.resolve('authRepository'), this.resolve('passwordHasher'));
        });
        this.registerTransient('uploadProfileImageUseCase', () => {
            console.log('DIContainer: Registering uploadProfileImageUseCase');
            return new index_3.UploadProfileImageUseCase(this.resolve('customerRepository'), this.resolve('restaurantOwnerRepository'), this.resolve('fileStorageService'));
        });
        this.registerTransient('updateRestaurantLocationUseCase', () => {
            console.log('DIContainer: Registering updateRestaurantLocationUseCase');
            return new index_3.UpdateRestaurantLocationUseCase(this.resolve('restaurantOwnerRepository'));
        });
        this.registerSingleton('authController', () => {
            console.log('DIContainer: Registering authController');
            return new AuthController_1.AuthController(this.resolve('registerCustomerUseCase'), this.resolve('registerRestaurantOwnerUseCase'), this.resolve('customerLoginUseCase'), this.resolve('restaurantOwnerLoginUseCase'), this.resolve('uploadProfileImageUseCase'), this.resolve('updateRestaurantLocationUseCase'));
        });
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
    get fileStorageService() {
        return this.resolve('fileStorageService');
    }
    get registerCustomerUseCase() {
        return this.resolve('registerCustomerUseCase');
    }
    get registerRestaurantOwnerUseCase() {
        return this.resolve('registerRestaurantOwnerUseCase');
    }
    get customerLoginUseCase() {
        return this.resolve('customerLoginUseCase');
    }
    get restaurantOwnerLoginUseCase() {
        return this.resolve('restaurantOwnerLoginUseCase');
    }
    get uploadProfileImageUseCase() {
        return this.resolve('uploadProfileImageUseCase');
    }
    get updateRestaurantLocationUseCase() {
        return this.resolve('updateRestaurantLocationUseCase');
    }
    get authController() {
        return this.resolve('authController');
    }
    get authMiddleware() {
        return this.resolve('authMiddleware');
    }
}
exports.DIContainer = DIContainer;
