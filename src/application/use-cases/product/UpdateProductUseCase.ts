import { Product, SizeOption, SizeName } from '@/domain/entities/Product';
import { IProductRepository, IProductOptionRepository, IProductOptionValueRepository } from '@/domain/repositories/index';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { CreateCategoryUseCase } from '@/application/use-cases/category/CreateCategoryUseCase';
import { v4 as uuidv4 } from 'uuid';

export interface UpdateProductOptionValueRequest {
    id?: string;
    name: string;
    additionalPrice?: number;
}

export interface UpdateProductOptionRequest {
    id?: string;
    name: string;
    required: boolean;
    values?: UpdateProductOptionValueRequest[];
}

export interface UpdateProductRequest {
    productId: string;
    categoryName?: string;
    productName?: string;
    description?: string;
    price?: number;
    discount?: number;
    sizeOptions?: SizeOption[] | null;
    productOption?: UpdateProductOptionRequest[];
    image?: Express.Multer.File;
    restaurantOwnerId: string;
}

export class UpdateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private fileStorageService: IFileStorageService,
        private categoryRepository: ICategoryRepository,
        private createCategoryUseCase: CreateCategoryUseCase,
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository
    ) {}

    async execute(request: UpdateProductRequest): Promise<Product> {
        const { productId, restaurantOwnerId, image, sizeOptions, categoryName } = request;

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
            if (imageUrl) {
                try {
                    await this.fileStorageService.DeleteOldImage(imageUrl);
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
        if (categoryName) {
            let category = await this.categoryRepository.findByNameAndRestaurantOwner(categoryName, restaurantOwnerId);
            if (!category) {
                category = await this.createCategoryUseCase.execute({ name: categoryName }, restaurantOwnerId);
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

        const result = await this.productRepository.update(productId, updatedProduct);

        if (request.productOption !== undefined) {
            await this.syncProductOptions(productId, request.productOption);
        }

        return result;
    }

    private async syncProductOptions(productId: string, options: UpdateProductOptionRequest[]): Promise<void> {
        const existingOptions = await this.productOptionRepository.findByProductId(productId);
        const incomingOptionIds = new Set(options.filter(opt => opt.id).map(opt => opt.id!));

        for (const existing of existingOptions) {
            if (!incomingOptionIds.has(existing.id)) {
                await this.productOptionRepository.delete(existing.id);
            }
        }

        for (const option of options) {
            let optionId = option.id;

            if (optionId) {
                await this.productOptionRepository.update(optionId, {
                    name: option.name,
                    required: option.required,
                    updatedAt: new Date()
                });
            } else {
                const created = await this.productOptionRepository.create({
                    id: uuidv4(),
                    productId,
                    name: option.name,
                    required: option.required,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                optionId = created.id;
            }

            if (option.values) {
                await this.syncOptionValues(optionId, option.values);
            }
        }
    }

    private async syncOptionValues(optionId: string, values: UpdateProductOptionValueRequest[]): Promise<void> {
        const existingValues = await this.productOptionValueRepository.findByOptionId(optionId);
        const incomingValueIds = new Set(values.filter(val => val.id).map(val => val.id!));

        for (const oldValue of existingValues) {
            if (!incomingValueIds.has(oldValue.id)) {
                await this.productOptionValueRepository.delete(oldValue.id);
            }
        }

        for (const value of values) {
            if (value.id) {
                await this.productOptionValueRepository.update(value.id, {
                    name: value.name,
                    additionalPrice: value.additionalPrice,
                    updatedAt: new Date()
                });
            } else {
                await this.productOptionValueRepository.create({
                    id: uuidv4(),
                    optionId,
                    name: value.name,
                    additionalPrice: value.additionalPrice,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }
}
