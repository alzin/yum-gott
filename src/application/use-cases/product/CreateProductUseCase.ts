import { Product, SizeOption } from "@/domain/entities/Product";
import { IProductRepository, IRestaurantOwnerRepository, ICategoryRepository } from "@/domain/repositories";
import { IFileStorageService } from "@/application/interface/IFileStorageService";
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
    categoryId: string; // Changed from category string
    productName: string;
    description: string;
    price: number;
    discount?: number;
    addSize?: SizeOption;
    image?: Express.Multer.File;
}

export class CreateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService,
        private categoryRepository: ICategoryRepository
    ) {}

    async execute(request: CreateProductRequest, restaurantOwnerId: string): Promise<Product> {
        const { image, addSize, categoryId } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        if (category.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('Category does not belong to this restaurant owner');
        }

        if (addSize && !Object.values(SizeOption).includes(addSize)) {
            throw new Error('Invalid size option');
        }

        let imageUrl: string | null = null;
        if (image) {
            imageUrl = await this.fileStorageService.UploadProductImage(image, uuidv4(), 'product');
        }

        const product: Product = {
            id: uuidv4(),
            categoryId, // Store categoryId instead of category string
            productName: request.productName,
            description: request.description,
            price: request.price,
            discount: request.discount,
            addSize,
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