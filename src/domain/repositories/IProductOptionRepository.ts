import { ProductOption } from "../entities/ProductOption";
export interface IProductOptionRepository {
    create(option: ProductOption): Promise<ProductOption>;
    findById(optionId: string): Promise<ProductOption | null>;
    findByProductId(productId: string): Promise<ProductOption[]>;
    delete(optionId: string): Promise<void>;
    existsByNameAndProductId(name: string, productId: string): Promise<boolean>;
}
