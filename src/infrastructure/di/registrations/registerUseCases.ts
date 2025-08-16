import { DIContainer } from '../DIContainer';
import {
    RegisterCustomerUseCase,
    RegisterRestaurantOwnerUseCase,
    UploadProfileImageUseCase,
    CustomerLoginUseCase,
    RestaurantOwnerLoginUseCase,
    UpdateRestaurantLocationUseCase,
    GetRestaurantOwnerProfileUseCase,
    GetCustomerProfileUseCase,
    LogoutUseCase,
    CleanupUnverifiedAccountsUseCase,
    RefreshTokenUseCase,
    DeleteCustomerAccountUseCase,
    DeleteRestaurantOwnerAccountUseCase
} from '@/application/use-cases/auth/index';
import { GetVideoFeedUseCase } from '@/application/use-cases/video-tracking/GetVideoFeedUseCase';
import { UpdateVideoPositionUseCase } from '@/application/use-cases/video-tracking/UpdateVideoPositionUseCase';
import { CreateProductUseCase, GetProductUseCase, GetProductsByRestaurantUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/product';
import { CreateCategoryUseCase, GetCategoriesByRestaurantUseCase } from '@/application/use-cases/category';
import { CreateProductOptionUseCase, CreateProductOptionValueUseCase, GetProductOptionsUseCase, DeleteProductOptionUseCase, DeleteProductOptionValueUseCase } from '@/application/use-cases/product-option/index';
import { CreateOpeningHoursUseCase, GetopeningHoursUseCase } from '@/application/use-cases/opening-hours';
import { DeleteOpeningHoursUseCase } from '@/application/use-cases/opening-hours/DeleteOpeningHoursUseCase';
import { AuthController } from '@/presentation/controller/AuthController';
import { AuthMiddleware } from '@/presentation/middleware/AuthMiddleware';
import { GetActivePayGatesUseCase } from '@/application/use-cases/paygate/GetActivePayGatesUseCase';

export function registerUseCases(container: DIContainer) {
    // Auth UseCases
    container.registerTransient('registerCustomerUseCase', () => {
        return new RegisterCustomerUseCase(
            container.resolve('customerRepository'),
            container.resolve('passwordHasher'),
            container.resolve('emailService'),
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

    container.registerTransient('getCustomerProfileUseCase', () => {
        return new GetCustomerProfileUseCase(
            container.resolve('customerRepository')
        );
    });

    container.registerTransient('deleteCustomerAccountUseCase', () => {
        return new DeleteCustomerAccountUseCase(
            container.resolve('customerRepository'),
            container.resolve('ICommentRepository')
        );
    });

    container.registerTransient('deleteRestaurantOwnerAccountUseCase', () => {
        return new DeleteRestaurantOwnerAccountUseCase(
            container.resolve('restaurantOwnerRepository'),
            container.resolve('ICommentRepository')
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

    // Video UseCases
    container.registerTransient('createVideoUseCase', () => new (require('@/application/use-cases/video/CreateVideoUseCase').CreateVideoUseCase)(
        container.resolve('IVideoRepository'),
        container.resolve('customerRepository'),
        container.resolve('fileStorageService')
    ));

    container.registerTransient('updateVideoUseCase', () => new (require('@/application/use-cases/video/UpdateVideoUseCase').UpdateVideoUseCase)(
        container.resolve('IVideoRepository'),
        container.resolve('customerRepository'),
        container.resolve('fileStorageService')
    ));

    container.registerTransient('deleteVideoUseCase', () => new (require('@/application/use-cases/video/DeleteVideoUseCase').DeleteVideoUseCase)(
        container.resolve('IVideoRepository'),
        container.resolve('customerRepository')
    ));

    container.registerTransient('getOpeningHoursUseCase', () => new GetopeningHoursUseCase(
        container.resolve('IOpeningHoursRepository'),
        container.resolve('restaurantOwnerRepository')
    ));
    container.registerTransient('deleteOpeningHoursUseCase', () => new DeleteOpeningHoursUseCase(
        container.resolve('IOpeningHoursRepository')
    ));
    container.registerTransient('updateOpeningHoursUseCase', () => new (require('@/application/use-cases/opening-hours/UpdateOpeningHoursUseCase').UpdateOpeningHoursUseCase)(
        container.resolve('IOpeningHoursRepository'),
        container.resolve('restaurantOwnerRepository')
    ));

    container.registerTransient('getAcceptedVideosUseCase', () => new (require('@/application/use-cases/video/GetAcceptedVideosUseCase').GetAcceptedVideosUseCase)(
        container.resolve('IVideoRepository')
    ));

    container.registerTransient('getCustomerAcceptedVideosUseCase', () => new (require('@/application/use-cases/video/GetCustomerAcceptedVideosUseCase').GetCustomerAcceptedVideosUseCase)(
        container.resolve('IVideoRepository')
    ));

    // Video Tracking UseCases
    container.registerTransient('getVideoFeedUseCase', () => new GetVideoFeedUseCase(
        container.resolve('IVideoRepository'),
        container.resolve('customerRepository'),
        container.resolve('restaurantOwnerRepository')
    ));

    container.registerTransient('updateVideoPositionUseCase', () => new UpdateVideoPositionUseCase(
        container.resolve('customerRepository'),
        container.resolve('restaurantOwnerRepository'),
        container.resolve('IVideoRepository')
    ));

    // Logout, Refresh, Cleanup
    container.registerTransient('logoutUseCase', () => new LogoutUseCase(container.resolve('authRepository')));
    container.registerTransient('refreshTokenUseCase', () => new RefreshTokenUseCase(container.resolve('authRepository')));
    container.registerSingleton('cleanupUnverifiedAccountsUseCase', () => new CleanupUnverifiedAccountsUseCase(
        container.resolve('customerRepository'),
        container.resolve('restaurantOwnerRepository')
    ));

    // Comment use cases
    container.registerTransient('createCommentUseCase', () => new (require('@/application/use-cases/comment/CreateCommentUseCase').CreateCommentUseCase)(
        container.resolve('ICommentRepository'),
        container.resolve('IVideoRepository')
    ));
    container.registerTransient('getVideoCommentsUseCase', () => new (require('@/application/use-cases/comment/GetVideoCommentsUseCase').GetVideoCommentsUseCase)(
        container.resolve('ICommentRepository')
    ));
    container.registerTransient('deleteCommentUseCase', () => new (require('@/application/use-cases/comment/DeleteCommentUseCase').DeleteCommentUseCase)(
        container.resolve('ICommentRepository')
    ));

    // Like use cases
    container.registerTransient('toggleVideoLikeUseCase', () => new (require('@/application/use-cases/like/ToggleVideoLikeUseCase').ToggleVideoLikeUseCase)(
        container.resolve('ILikeRepository'),
        container.resolve('IVideoRepository')
    ));
    container.registerTransient('getVideoLikesUseCase', () => new (require('@/application/use-cases/like/GetVideoLikesUseCase').GetVideoLikesUseCase)(
        container.resolve('ILikeRepository'),
        container.resolve('IVideoRepository')
    ));

    // Controllers & Middleware
    container.registerSingleton('authController', () => new AuthController());
    container.registerSingleton('authMiddleware', () => new AuthMiddleware(container.resolve('authRepository')));

    // PayGate use cases
    container.registerTransient('getActivePayGatesUseCase', () => new GetActivePayGatesUseCase(
        container.resolve('IPayGateRepository')
    ));
} 