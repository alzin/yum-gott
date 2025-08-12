import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { ICommentRepository } from "@/domain/repositories/ICommentRepository";

export class DeleteCustomerAccountUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private commentRepository: ICommentRepository
    ) { }

    async execute(customerId: string): Promise<void> {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Delete user's comments first
        await this.commentRepository.deleteByUser(customerId, 'customer');

        // Then delete the customer account
        await this.customerRepository.delete(customerId);
    }
} 