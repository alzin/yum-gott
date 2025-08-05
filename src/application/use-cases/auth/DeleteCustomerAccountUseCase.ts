import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";

export class DeleteCustomerAccountUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(customerId: string): Promise<void> {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        await this.customerRepository.delete(customerId);
    }
} 