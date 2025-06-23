import { Product, SizeOption, SizeName } from "@/domain/entities/Product";
import { IProductRepository, IRestaurantOwnerRepository, ICategoryRepository } from "@/domain/repositories";
import { IFileStorageService } from "@/application/interface/IFileStorageService";
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
    categoryName: string;
    productName: string;
    description: string;
    price: number;
    discount?: number;
    sizeOptions?: SizeOption[] | null; // Updated to array with SizeName
    image?: Express.Multer.File;
}

export class CreateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService,
        private categoryRepository: ICategoryRepository
    ) { }

    async execute(request: CreateProductRequest, restaurantOwnerId: string): Promise<Product> {
        const { image, sizeOptions, categoryName } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        const category = await this.categoryRepository.findByNameAndRestaurantOwner(categoryName, restaurantOwnerId);
        if (!category) {
            throw new Error('Category not found');
        }
        if (category.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Category does not belong to this restaurant owner');
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

        await this.ExistingByNameAndRestaurantId(request, restaurantOwnerId);
        return await this.productRepository.create(product);
    }

    private async ExistingByNameAndRestaurantId(request: CreateProductRequest, restaurantOwnerId: string): Promise<void> {
        const productExists = await this.productRepository.ExistingByNameAndRestaurantId(request.productName, restaurantOwnerId);
        if (productExists) {
            throw new Error('Product already exists with this name in your restaurant');
        }
    }
}