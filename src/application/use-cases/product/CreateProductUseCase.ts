import { Product, SizeOption, SizeName } from "@/domain/entities/Product";
import { IProductRepository, IRestaurantOwnerRepository, ICategoryRepository, IProductOptionRepository, IProductOptionValueRepository } from "@/domain/repositories";
import { IFileStorageService } from "@/application/interface/IFileStorageService";
import { v4 as uuidv4 } from 'uuid';
import { CreateCategoryUseCase } from "@/application/use-cases/category/CreateCategoryUseCase";

export interface ProductOptionValueInput {
    name: string;
    additionalPrice?: number;
}

export interface ProductOptionInput {
    name: string;
    required: boolean;
    values: ProductOptionValueInput[];
}

export interface CreateProductRequest {
    categoryName: string;
    productName: string;
    description: string;
    price: number;
    discount?: number;
    sizeOptions?: SizeOption[] | null;
    image?: Express.Multer.File;
    options?: ProductOptionInput[];
}

export class CreateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService,
        private categoryRepository: ICategoryRepository,
        private createCategoryUseCase: CreateCategoryUseCase,
        private productOptionRepository: IProductOptionRepository,
        private productOptionValueRepository: IProductOptionValueRepository
    ) { }

    async execute(request: CreateProductRequest, restaurantOwnerId: string): Promise<Product> {
        const { image, sizeOptions, categoryName } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        let category = await this.categoryRepository.findByNameAndRestaurantOwner(categoryName, restaurantOwnerId)
        if (!category) {
            category = await this.createCategoryUseCase.execute({ name: categoryName }, restaurantOwnerId);

        }
        if (category.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Category does not belong to this restaurant owner');
        }


        let imageUrl: string | null = null;
        if (image) {
            imageUrl = await this.fileStorageService.UploadProductImage(image, uuidv4(), 'product');
        }

        const product: Product = {
            id: uuidv4(),
            categoryName: category.name,
            productName: request.productName,
            description: request.description,
            price: request.price,
            discount: request.discount,
            sizeOptions: sizeOptions || null,
            imageUrl,
            restaurantOwnerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.checkExistingProductByNameAndRestaurantId(request, restaurantOwnerId);
        const createdProduct = await this.productRepository.create(product);

        if (request.options && request.options.length > 0) {
            for (const optionInput of request.options) {
                const option = await this.productOptionRepository.create({
                    id: uuidv4(),
                    productId: createdProduct.id!,
                    name: optionInput.name,
                    required: optionInput.required,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                if (optionInput.values && optionInput.values.length > 0) {
                    for (const valueInput of optionInput.values) {
                        await this.productOptionValueRepository.create({
                            id: uuidv4(),
                            optionId: option.id,
                            name: valueInput.name,
                            additionalPrice: valueInput.additionalPrice,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }
            }
        }
        return createdProduct;
    }

    private async checkExistingProductByNameAndRestaurantId(request: CreateProductRequest, restaurantOwnerId: string): Promise<void> {
        const productExists = await this.productRepository.checkExistingProductByNameAndRestaurantId(request.productName, restaurantOwnerId);
        if (productExists) {
            throw new Error('Product already exists with this name in your restaurant');
        }
    }
}