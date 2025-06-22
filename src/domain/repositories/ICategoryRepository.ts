import { Category } from '../entities/Category';

export interface ICategoryRepository {
    create(category: Category): Promise<Category>;
    findById(id: string): Promise<Category | null>;
    findByNameAndRestaurantOwner(name: string, restaurantOwnerId: string): Promise<Category | null>;
    findByRestaurantOwnerId(restaurantOwnerId: string): Promise<Category[]>;
    update(id: string, category: Partial<Category>): Promise<Category>;
    delete(id: string): Promise<void>;
}