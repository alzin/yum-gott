import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';

export class CleanupUnverifiedAccountsUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(): Promise<{ customerCount: number; restaurantOwnerCount: number }> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const customerCount = await this.customerRepository.deleteUnverifiedOlderThan(twentyFourHoursAgo);
        
        const restaurantOwnerCount = await this.restaurantOwnerRepository.deleteUnverifiedOlderThan(twentyFourHoursAgo);
        
        return { customerCount, restaurantOwnerCount };
    }
}
