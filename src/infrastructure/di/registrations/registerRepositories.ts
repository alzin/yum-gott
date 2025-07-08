import { DIContainer } from '../DIContainer';
import { CustomerRepository, RestaurantOwnerRepository, AuthRepository, CategoryRepository, ProductRepository, ProductOptionRepository, ProductOptionValueRepository } from '../../repositories';
import { DatabaseConnection } from '../../database/DataBaseConnection';

export function registerRepositories(container: DIContainer) {
    container.registerSingleton('databaseConnection', () => {
        console.log('DIContainer: Registering databaseConnection');
        return DatabaseConnection.getInstance();
    });

    container.registerSingleton('customerRepository', () => {
        console.log('DIContainer: Registering customerRepository');
        return new CustomerRepository(container.resolve('databaseConnection'));
    });

    container.registerSingleton('restaurantOwnerRepository', () => {
        console.log('DIContainer: Registering restaurantOwnerRepository');
        return new RestaurantOwnerRepository(container.resolve('databaseConnection'));
    });

    container.registerSingleton('authRepository', () => {
        console.log('DIContainer: Registering authRepository');
        return new AuthRepository();
    });

    container.registerSingleton('ICategoryRepository', () => new CategoryRepository(container.resolve('databaseConnection')));
    container.registerSingleton('IProductRepository', () => new ProductRepository((container.resolve('databaseConnection') as DatabaseConnection).getPool()));
    container.registerSingleton('productOptionRepository', () => new ProductOptionRepository(container.resolve('databaseConnection')));
    container.registerSingleton('productOptionValueRepository', () => new ProductOptionValueRepository(container.resolve('databaseConnection')));
    container.registerSingleton('IProductOptionRepository', () => new ProductOptionRepository(container.resolve('databaseConnection')));
} 