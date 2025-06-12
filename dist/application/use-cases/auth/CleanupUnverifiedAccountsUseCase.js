"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupUnverifiedAccountsUseCase = void 0;
class CleanupUnverifiedAccountsUseCase {
    constructor(customerRepository, restaurantOwnerRepository) {
        this.customerRepository = customerRepository;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }
    async execute() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // Delete unverified customers older than 24 hours
        const customerCount = await this.customerRepository.deleteUnverifiedOlderThan(twentyFourHoursAgo);
        // Delete unverified restaurant owners older than 24 hours
        const restaurantOwnerCount = await this.restaurantOwnerRepository.deleteUnverifiedOlderThan(twentyFourHoursAgo);
        return { customerCount, restaurantOwnerCount };
    }
}
exports.CleanupUnverifiedAccountsUseCase = CleanupUnverifiedAccountsUseCase;
