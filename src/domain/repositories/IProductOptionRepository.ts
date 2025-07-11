import { ProductOption } from "../entities/ProductOption";
export interface IProductOptionRepository {
    create(option: ProductOption): Promise<ProductOption>;
    findById(optionId: string): Promise<ProductOption | null>;
    findByProductId(productId: string): Promise<ProductOption[]>;
    update(optionId: string, updates: Partial<ProductOption>): Promise<ProductOption>
    delete(optionId: string): Promise<void>;
    checkExistsByNameAndProductId(name: string, productId: string): Promise<boolean>;
}
