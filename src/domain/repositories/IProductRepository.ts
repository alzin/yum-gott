import { Product } from "../entities/Product"

export interface IProductRepository {
    create(product: Product): Promise<Product>
    findById(id: string): Promise<Product | null>
    findByRestaurantOwnerId(restaurantOwnerId: string): Promise<Product[]>
    ExistingByNameAndRestaurantId(productName: string, restaurantOwnerId: string): Promise<boolean>;
    update(id: string, product: Partial<Product>): Promise<Product>
    delete(id: string): Promise<void>
}