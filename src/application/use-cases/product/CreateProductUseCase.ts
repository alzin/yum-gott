import { Product, SizeOption } from "@/domain/entities/Product";
import { IProductRepository , IRestaurantOwnerRepository} from "@/domain/repositories/index";
import { IFileStorageService } from "@/application/interface/IFileStorageService";
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
    category: string;
    productName: string;
    description: string;
    price: number;
    discount?: number;
    addSize?: SizeOption;
    image?: Express.Multer.File;
    // Removed restaurantOwnerId from the request interface
}

export class CreateProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(request: CreateProductRequest, restaurantOwnerId: string): Promise<Product> {
        const { image, addSize } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        if (addSize && !Object.values(SizeOption).includes(addSize)) {
            throw new Error('Invalid size option');
        }

        // Upload image if provided
        let imageUrl: string | null = null;
        if (image) {
            imageUrl = await this.fileStorageService.UploadProductImage(image, uuidv4(), 'product');
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