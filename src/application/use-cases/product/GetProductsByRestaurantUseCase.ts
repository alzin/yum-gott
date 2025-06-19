import { Product } from '@/domain/entities/Product';
import { IProductRepository , IRestaurantOwnerRepository} from '@/domain/repositories/index';

export class GetProductsByRestaurantUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }
    async execute(restaurantOwnerId: string): Promise<Product[]> {
        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }
        return await this.productRepository.findByRestaurantOwnerId(restaurantOwnerId)
    }
}