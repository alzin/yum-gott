import { IProductOptionRepository, IProductRepository, IProductOptionValueRepository } from '@/domain/repositories/index';
// import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';

export interface DeleteProductOptionValueRequest {
    valueId: string;
}
export class DeleteProductOptionValueUseCase {
    constructor(
        private productOptionValueRepository: IProductOptionValueRepository,
        private productOptionRepository: IProductOptionRepository,
        private productRepository: IProductRepository,
        // private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }

    async execute(request: DeleteProductOptionValueRequest, restaurantOwnerId: string): Promise<void> {
        const { valueId } = request;

        const value = await this.productOptionValueRepository.findById(valueId);
        if (!value) {
            throw new Error('Option value not found');
        }
        const option = await this.productOptionRepository.findById(value.optionId);
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

        await this.productOptionValueRepository.delete(valueId);
    }
}