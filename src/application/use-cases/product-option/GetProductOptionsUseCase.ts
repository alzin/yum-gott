import { ProductOption , ProductOptionValue } from "@/domain/entities/index";
import { IProductOptionValueRepository , IProductOptionRepository , IProductRepository } from "@/domain/repositories/index";
// import { IRestaurantOwnerRepository } from "@/domain/repositories";

export interface ProductOptionWithValue extends ProductOption{
    values: ProductOptionValue[];
}


export class GetProductOptionsUseCase {
    constructor(
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository,
        private productRepository: IProductRepository,
        // private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(productId: string, restaurantOwnerId: string): Promise<ProductOptionWithValue[]> {
        // Validate product exists and belongs to restaurant owner
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        const options = await this.productOptionRepository.findByProductId(productId);
        const optionsWithValues: ProductOptionWithValue[] = [];

        for (const option of options) {
            const values = await this.productOptionValueRepository.findByOptionId(option.id);
            optionsWithValues.push({ ...option, values });
        }

        return optionsWithValues;
    }
}
