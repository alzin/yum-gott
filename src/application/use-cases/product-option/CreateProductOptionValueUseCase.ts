import { ProductOptionValue } from '@/domain/entities/ProductOptionValue';
import { IProductOptionRepository, IProductRepository, IProductOptionValueRepository } from '@/domain/repositories/index';

// import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductOptionValueRequest {
    optionId: string;
    name: string;
    additionalPrice?: number;
}

export class CreateProductOptionValueUseCase {
    constructor(
        private productOptionValueRepository: IProductOptionValueRepository,
        private productOptionRepository: IProductOptionRepository,
        private productRepository: IProductRepository,
        // private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }

    async execute(request: CreateProductOptionValueRequest, restaurantOwnerId: string): Promise<ProductOptionValue> {
        const { optionId, name, additionalPrice } = request;

        const option = await this.productOptionRepository.findById(optionId);
        if (!option) {
            throw new Error('Option not found');
        }

        const product = await this.productRepository.findById(option.productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        const value: ProductOptionValue = {
            id: uuidv4(),
            optionId,
            name,
            additionalPrice,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.productOptionValueRepository.create(value);
    }
}
