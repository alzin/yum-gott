import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
export class GetCustomerProfileUseCase {
    constructor(private customerRepository: ICustomerRepository) {}
    async execute(userId: string) {
        try {
            const profile = await this.customerRepository.getCustomerProfile(userId);
            return {
                success: true,
                data: profile
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch customer profile'
            };
        }
    }
}