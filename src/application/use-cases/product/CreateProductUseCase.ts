import { Product, SizeOption } from "@/domain/entities/Product";
import { IProductRepository } from "@/domain/repositories";
import { IRestaurantOwnerRepository } from "@/domain/repositories";
import { IFileStorageService } from "@/application/interface/IFileStorageService";
import { v4 as uuidv4 } from 'uuid'

export interface CreateProductUseCase {
    category: string;
    productName: string;
    description: string;
    price: number;
    discount?: number;
    addSize?: SizeOption;
    image?: Express.Multer.File;
    restaurantOwnerId: string;
}

export class CreateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService
    ) { }
    async execute(request: CreateProductUseCase): Promise<Product> {
        const { restaurantOwnerId, image, addSize } = request
        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        // Validate addSize if provided
        if (addSize && !Object.values(SizeOption).includes(addSize)) {
            throw new Error('Invalid size option');
        }

        // Upload image if provided
        let imageUrl: string | null = null;
        if (image) {
            imageUrl = await this.fileStorageService.uploadFile(image, uuidv4(), 'product');
        }
        const product: Product = {
            id: uuidv4(),
            category: request.category,
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

        return await this.productRepository.create(product);
    }

}