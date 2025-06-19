import { ProductOptionValue } from "../entities/ProductOptionValue";
export interface IProductOptionValueRepository {
    create(value: ProductOptionValue): Promise<ProductOptionValue>;
    findById(valueId: string): Promise<ProductOptionValue | null>;
    findByOptionId(optionId: string): Promise<ProductOptionValue[]>;
    delete(valueId: string): Promise<void>;
}