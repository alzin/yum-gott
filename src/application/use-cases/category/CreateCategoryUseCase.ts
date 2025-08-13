import { Category } from '@/domain/entities/Category';
import { ICategoryRepository, IRestaurantOwnerRepository } from '@/domain/repositories';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCategoryRequest {
    name: string;
}  
   
export class CreateCategoryUseCase {
    constructor(
        private categoryRepository: ICategoryRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(request: CreateCategoryRequest, restaurantOwnerId: string): Promise<Category> {
        const { name } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        const existingCategory = await this.categoryRepository.findByNameAndRestaurantOwner(name, restaurantOwnerId);
        if (existingCategory) {
            throw new Error('Category already exists for this restaurant');
        }

        const category: Category = {
            id: uuidv4(),
            name,
            restaurantOwnerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.categoryRepository.create(category);
    }
}