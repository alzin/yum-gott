import { DIContainer } from '../DIContainer';
import {
    RegisterCustomerUseCase,
    RegisterRestaurantOwnerUseCase,
    UploadProfileImageUseCase,
    CustomerLoginUseCase,
    RestaurantOwnerLoginUseCase,
    UpdateRestaurantLocationUseCase,
    GetRestaurantOwnerProfileUseCase,
    LogoutUseCase,
    CleanupUnverifiedAccountsUseCase,
    RefreshTokenUseCase
} from '@/application/use-cases/auth/index';
import { CreateProductUseCase, GetProductUseCase, GetProductsByRestaurantUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/product';
import { CreateCategoryUseCase, GetCategoriesByRestaurantUseCase } from '@/application/use-cases/category';
import { CreateProductOptionUseCase, CreateProductOptionValueUseCase, GetProductOptionsUseCase, DeleteProductOptionUseCase, DeleteProductOptionValueUseCase } from '@/application/use-cases/product-option/index';
import { CreateOpeningHoursUseCase, GetopeningHoursUseCase } from '@/application/use-cases/opening-hours';
import { DeleteOpeningHoursUseCase } from '@/application/use-cases/opening-hours/DeleteOpeningHoursUseCase';
import { AuthController } from '@/presentation/controller/AuthController';
import { AuthMiddleware } from '@/presentation/middleware/AuthMiddleware';

export function registerUseCases(container: DIContainer) {
    // Auth UseCases
    container.registerTransient('registerCustomerUseCase', () => {
        return new RegisterCustomerUseCase(
            container.resolve('customerRepository'),
            container.resolve('passwordHasher'),
            container.resolve('authRepository')
        );
    });

    container.registerTransient('registerRestaurantOwnerUseCase', () => {
        return new RegisterRestaurantOwnerUseCase(
            container.resolve('restaurantOwnerRepository'),
            container.resolve('passwordHasher'),
            container.resolve('authRepository')
        );
    });

    container.registerTransient('customerLoginUseCase', () => {
        console.log('DIContainer: Registering customerLoginUseCase');
        return new CustomerLoginUseCase(
            container.resolve('customerRepository'),
            container.resolve('authRepository'),
            container.resolve('passwordHasher')
        );
    });

    container.registerTransient('restaurantOwnerLoginUseCase', () => {
        return new RestaurantOwnerLoginUseCase(
            container.resolve('restaurantOwnerRepository'),
            container.resolve('authRepository'),
            container.resolve('passwordHasher')
        );
    });

    container.registerTransient('uploadProfileImageUseCase', () => {
        return new UploadProfileImageUseCase(
            container.resolve('customerRepository'),
            container.resolve('restaurantOwnerRepository'),
            container.resolve('fileStorageService')
        );
    });

    container.registerTransient('updateRestaurantLocationUseCase', () => {
        console.log('DIContainer: Registering updateRestaurantLocationUseCase');
        return new UpdateRestaurantLocationUseCase(
            container.resolve('restaurantOwnerRepository')
        );
    });

    container.registerTransient('getRestaurantOwnerProfileUseCase', () => {
        return new GetRestaurantOwnerProfileUseCase(
            container.resolve('restaurantOwnerRepository')
        );
    });

    // Product UseCases
    container.registerTransient('createProductUseCase', () => new CreateProductUseCase(
        container.resolve('IProductRepository'),
        container.resolve('restaurantOwnerRepository'),
        container.resolve('fileStorageService'),
        container.resolve('ICategoryRepository'),
        container.resolve('createCategoryUseCase'),
        container.resolve('productOptionRepository'),
        container.resolve('productOptionValueRepository')
    ));
    container.registerTransient('getProductUseCase', () => new GetProductUseCase(
        container.resolve('IProductRepository')
    ));
    container.registerTransient('getProductsByRestaurantUseCase', () => new GetProductsByRestaurantUseCase(
        container.resolve('IProductRepository'),
        container.resolve('restaurantOwnerRepository')
    ));
    container.registerTransient('updateProductUseCase', () => new UpdateProductUseCase(
        container.resolve('IProductRepository'),
        container.resolve('fileStorageService'),
        container.resolve('ICategoryRepository'),
        container.resolve('createCategoryUseCase'),
        container.resolve('productOptionRepository'),
        container.resolve('productOptionValueRepository')
    ));
    container.registerTransient('deleteProductUseCase', () => new DeleteProductUseCase(
        container.resolve('IProductRepository'),
        container.resolve('fileStorageService')
    ));

    // Category UseCases
    container.registerTransient('createCategoryUseCase', () => new CreateCategoryUseCase(
        container.resolve('ICategoryRepository'),
        container.resolve('restaurantOwnerRepository')
    ));
    container.registerTransient('getCategoriesByRestaurantUseCase', () => new GetCategoriesByRestaurantUseCase(
        container.resolve('ICategoryRepository'),
        container.resolve('restaurantOwnerRepository')
    ));

    // Product Option UseCases
    container.registerTransient('createProductOptionUseCase', () => new CreateProductOptionUseCase(
        container.resolve('productOptionRepository'),
        container.resolve('IProductRepository')
    ));
    container.registerTransient('createProductOptionValueUseCase', () => new CreateProductOptionValueUseCase(
        container.resolve('productOptionValueRepository'),
        container.resolve('productOptionRepository'),
        container.resolve('IProductRepository')
    ));
    container.registerTransient('getProductOptionsUseCase', () => new GetProductOptionsUseCase(
        container.resolve('productOptionRepository'),
        container.resolve('productOptionValueRepository'),
        container.resolve('IProductRepository')
    ));
    container.registerTransient('deleteProductOptionUseCase', () => new DeleteProductOptionUseCase(
        container.resolve('productOptionRepository'),
        container.resolve('productOptionValueRepository'),
        container.resolve('IProductRepository')
    ));
    container.registerTransient('deleteProductOptionValueUseCase', () => new DeleteProductOptionValueUseCase(
        container.resolve('productOptionValueRepository'),
        container.resolve('productOptionRepository'),
        container.resolve('IProductRepository')
    ));

    // Opening Hours UseCases
    container.registerTransient('createOpeningHoursUseCase', () => new CreateOpeningHoursUseCase(
        container.resolve('IOpeningHoursRepository'),
        container.resolve('restaurantOwnerRepository')
    ));
    container.registerTransient('getOpeningHoursUseCase', () => new GetopeningHoursUseCase(
        container.resolve('IOpeningHoursRepository'),
        container.resolve('restaurantOwnerRepository')
    ));
    container.registerTransient('deleteOpeningHoursUseCase', () => new DeleteOpeningHoursUseCase(
        container.resolve('IOpeningHoursRepository')
    ));

    // Logout, Refresh, Cleanup
    container.registerTransient('logoutUseCase', () => new LogoutUseCase(container.resolve('authRepository')));
    container.registerTransient('refreshTokenUseCase', () => new RefreshTokenUseCase(container.resolve('authRepository')));
    container.registerSingleton('cleanupUnverifiedAccountsUseCase', () => new CleanupUnverifiedAccountsUseCase(
        container.resolve('customerRepository'),
        container.resolve('restaurantOwnerRepository')
    ));

    // Controllers & Middleware
    container.registerSingleton('authController', () => new AuthController());
    container.registerSingleton('authMiddleware', () => new AuthMiddleware(container.resolve('authRepository')));
} 