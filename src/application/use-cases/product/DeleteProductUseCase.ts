import { IProductRepository } from "@/domain/repositories";
import { IFileStorageService } from "@/application/interface/IFileStorageService";
import { IRestaurantOwnerRepository } from "@/domain/repositories";


export interface DeleteProductRequest {
    productId: string;
    restaurantOwnerId: string;
}

export class DeleteProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService
    ) { }
    async execute(request: DeleteProductRequest): Promise<void> {
        const { productId, restaurantOwnerId } = request;

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        if (product.imageUrl) {
            await this.fileStorageService.deleteFile(product.imageUrl);
        }

        await this.productRepository.delete(productId)
    }

}