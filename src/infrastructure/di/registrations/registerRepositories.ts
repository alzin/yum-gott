import { DIContainer } from '../DIContainer';
import { VideoRepository, CustomerRepository, RestaurantOwnerRepository, AuthRepository, CategoryRepository, ProductRepository, ProductOptionRepository, ProductOptionValueRepository, OpeningHoursRepository, CommentRepository, LikeRepository } from '../../repositories';
import { DatabaseConnection } from '../../database/DataBaseConnection';

export function registerRepositories(container: DIContainer) {
    container.registerSingleton('databaseConnection', () => {
        return DatabaseConnection.getInstance();
    });

    container.registerSingleton('customerRepository', () => {
        return new CustomerRepository(container.resolve('databaseConnection'));
    });

    container.registerSingleton('restaurantOwnerRepository', () => {
        return new RestaurantOwnerRepository(container.resolve('databaseConnection'));
    });

    container.registerSingleton('authRepository', () => { return new AuthRepository(); });
    container.registerSingleton('ICategoryRepository', () => new CategoryRepository(container.resolve('databaseConnection')));
    container.registerSingleton('IProductRepository', () => new ProductRepository((container.resolve('databaseConnection') as DatabaseConnection).getPool()));
    container.registerSingleton('productOptionRepository', () => new ProductOptionRepository(container.resolve('databaseConnection')));
    container.registerSingleton('productOptionValueRepository', () => new ProductOptionValueRepository(container.resolve('databaseConnection')));
    container.registerSingleton('IProductOptionRepository', () => new ProductOptionRepository(container.resolve('databaseConnection')));
    container.registerSingleton('IOpeningHoursRepository', () => new OpeningHoursRepository(container.resolve('databaseConnection')));
    container.registerSingleton('IVideoRepository', () => new VideoRepository(container.resolve('databaseConnection')));
    container.registerSingleton('ICommentRepository', () => new CommentRepository(container.resolve('databaseConnection')));
    container.registerSingleton('ILikeRepository', () => new LikeRepository(container.resolve('databaseConnection')));
} 