"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRestaurantOwnerProfileUseCase = void 0;
class GetRestaurantOwnerProfileUseCase {
    constructor(restaurantOwnerRepository) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }
    async execute(userId) {
        try {
            const profile = await this.restaurantOwnerRepository.getRestaurantOwnerProfile(userId);
            return {
                success: true,
                data: profile
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch restaurant owner profile'
            };
        }
    }
}
exports.GetRestaurantOwnerProfileUseCase = GetRestaurantOwnerProfileUseCase;
