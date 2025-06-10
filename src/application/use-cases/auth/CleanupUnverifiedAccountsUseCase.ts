import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';

export class CleanupUnverifiedAccountsUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(): Promise<{ customerCount: number; restaurantOwnerCount: number }> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Delete unverified customers older than 24 hours
        const customerCount = await this.customerRepository.deleteUnverifiedOlderThan(twentyFourHoursAgo);
        
        // Delete unverified restaurant owners older than 24 hours
        const restaurantOwnerCount = await this.restaurantOwnerRepository.deleteUnverifiedOlderThan(twentyFourHoursAgo);
        
        return { customerCount, restaurantOwnerCount };
    }
}
