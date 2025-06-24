import { Category } from '@/domain/entities/Category';
import { ICategoryRepository, IRestaurantOwnerRepository } from '@/domain/repositories';

export class GetCategoriesByRestaurantUseCase {
    constructor(
        private categoryRepository: ICategoryRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(restaurantOwnerId: string): Promise<Category[]> {
        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        return await this.categoryRepository.findByRestaurantOwnerId(restaurantOwnerId);
    }
}