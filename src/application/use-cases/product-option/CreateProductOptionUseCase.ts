import { ProductOption } from '@/domain/entities/ProductOption';
import { IProductOptionRepository , IProductRepository } from '@/domain/repositories/index';
// import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductOptionRequest {
    productId: string;
    name: string;
}

export class CreateProductOptionUseCase {
    constructor(
        private productOptionRepository: IProductOptionRepository,
        private productRepository: IProductRepository,
        // private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(request: CreateProductOptionRequest, restaurantOwnerId: string): Promise<ProductOption> {
        const { productId, name } = request;

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        const optionExists = await this.productOptionRepository.existsByNameAndProductId(name, productId);
        if (optionExists) {
            throw new Error('Option already exists with this name for the product');
        }

        const option: ProductOption = {
            id: uuidv4(),
            productId,
            name,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.productOptionRepository.create(option);
    }
}