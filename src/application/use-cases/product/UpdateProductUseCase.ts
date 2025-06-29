import { Product, SizeOption, SizeName } from '@/domain/entities/Product';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { CreateCategoryUseCase } from '@/application/use-cases/category/CreateCategoryUseCase';

export interface UpdateProductRequest {
    productId: string;
    categoryName?: string;
    productName?: string;
    description?: string;
    price?: number;
    discount?: number;
    sizeOptions?: SizeOption[] | null;
    image?: Express.Multer.File;
    restaurantOwnerId: string;
}

export class UpdateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private fileStorageService: IFileStorageService,
        private categoryRepository: ICategoryRepository,
        private createCategoryUseCase: CreateCategoryUseCase
    ) { }
    async execute(request: UpdateProductRequest & { newCategoryName?: string }): Promise<Product> {
        const { productId, restaurantOwnerId, image, sizeOptions, categoryName, newCategoryName } = request;

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Unauthorized: Product does not belong to this restaurant owner');
        }

        if (sizeOptions) {
            for (const size of sizeOptions) {
                if (!Object.values(SizeName).includes(size.name)) {
                    throw new Error(`Invalid size name: ${size.name}. Must be one of: ${Object.values(SizeName).join(', ')}`);
                }
                if (typeof size.additionalPrice !== 'number' || size.additionalPrice < 0) {
                    throw new Error('Invalid size option: non-negative additionalPrice is required');
                }
            }
        }

        let imageUrl = product.imageUrl;
        if (image) {
            if (product.imageUrl) {
                try {
                    await this.fileStorageService.DeleteOldImage(product.imageUrl);
                } catch (error) {
                    console.error('Failed to delete old image:', error);
                }
            }
            imageUrl = await this.fileStorageService.UploadProductImage(
                image,
                productId,
                'product',
                product.imageUrl || undefined
            );
        }

        let categoryNameToUse = product.categoryName;
        if (newCategoryName) {
            const category = await this.createCategoryUseCase.execute({ name: newCategoryName }, restaurantOwnerId);
            categoryNameToUse = category.name;
        } else if (categoryName) {
            let category = await this.categoryRepository.findByNameAndRestaurantOwner(categoryName, restaurantOwnerId);
            if (!category) {
                throw new Error('Category not found');
            }
            categoryNameToUse = category.name;
        }

        const updatedProduct: Partial<Product> = {
            categoryName: categoryNameToUse,
            productName: request.productName,
            description: request.description,
            price: request.price,
            discount: request.discount,
            sizeOptions: sizeOptions !== undefined ? sizeOptions : product.sizeOptions,
            imageUrl,
            updatedAt: new Date()
        };

        return await this.productRepository.update(productId, updatedProduct);
    }
}