import { IProductOptionRepository ,IRestaurantOwnerRepository ,IProductOptionValueRepository ,IProductRepository} from '@/domain/repositories/index';

export interface DeleteProductOptionRequest {
    optionId: string;
}

export class DeleteProductOptionUseCase {
    constructor(
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository,
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(request: DeleteProductOptionRequest, restaurantOwnerId: string): Promise<void> {
        const { optionId } = request;

        // Validate option exists
        const option = await this.productOptionRepository.findById(optionId);
        if (!option) {
            throw new Error('Option not found');
        }

        // Validate product and ownership
        const product = await this.productRepository.findById(option.productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        // Delete all values associated with this option
        const values = await this.productOptionValueRepository.findByOptionId(optionId);
        for (const value of values) {
            await this.productOptionValueRepository.delete(value.id);
        }

        // Delete the option
        await this.productOptionRepository.delete(optionId);
    }
}