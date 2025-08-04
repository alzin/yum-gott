import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";

export class DeleteCustomerAccountUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(customerId: string): Promise<void> {
        // Check if customer exists
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Delete the customer account
        await this.customerRepository.delete(customerId);
    }
} 