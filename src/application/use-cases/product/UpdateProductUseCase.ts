import { Product, SizeOption } from '@/domain/entities/Product';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';


export interface UpdateProductRequest {
    productId: string;
    categoryName?: string;
    productName?: string;
    description?: string;
    price?: number;
    discount?: number;
    addSize?: SizeOption;
    image?: Express.Multer.File;
    restaurantOwnerId: string;
}

export class UpdateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        // private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService
    ) { }
    async execute(request: UpdateProductRequest): Promise<Product> {
        const { productId, restaurantOwnerId, image, addSize, categoryName } = request;

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        if (addSize && !Object.values(SizeOption).includes(addSize)) {
            throw new Error('Invalid size option');
        }

        let imageUrl = product.imageUrl;
        if (image) {
            // If there's an existing image, delete it first
            if (product.imageUrl) {
                try {
                    await this.fileStorageService.DeleteOldImage(product.imageUrl);
                } catch (error) {
                    console.error('Failed to delete old image:', error);
                    // Continue with upload even if deletion fails
                }
            }

            // Upload the new image
            imageUrl = await this.fileStorageService.UploadProductImage(
                image,
                productId,
                'product',
                product.imageUrl || undefined
            );
        }

        let categoryId = product.categoryId;
        if (categoryName) {
            // جلب categoryId من الاسم
            const diContainer = require('@/infrastructure/di/DIContainer').DIContainer;
            const categoryRepository = diContainer.getInstance().resolve('ICategoryRepository');
            const category = await categoryRepository.findByNameAndRestaurantOwner(categoryName, restaurantOwnerId);
            if (!category) {
                throw new Error('Category not found');
            }
            categoryId = category.id;
        }

        const updatedProduct: Partial<Product> = {
            categoryId,
            productName: request.productName,
            description: request.description,
            price: request.price,
            discount: request.discount,
            addSize,
            imageUrl,
            updatedAt: new Date()
        };

        return await this.productRepository.update(productId, updatedProduct);
    }
} 