import { Product } from "@/domain/entities/Product";
import { IProductRepository } from "@/domain/repositories";

export class GetProductUseCase {
    constructor(private productRepository: IProductRepository) { }
    async execute(productId: string): Promise<Product | null> {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error("Product not found")
        }
        return product
    }
}