"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRestaurantLocationUseCase = void 0;
class UpdateRestaurantLocationUseCase {
    constructor(restaurantOwnerRepository) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }
    async execute(request) {
        const { userId, address, latitude, longitude } = request;
        // Validate user exists
        const restaurantOwner = await this.restaurantOwnerRepository.findById(userId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }
        // Update location
        const updatedRestaurantOwner = await this.restaurantOwnerRepository.updateLocation(userId, {
            address,
            latitude,
            longitude
        });
        return { restaurantOwner: updatedRestaurantOwner };
    }
}
exports.UpdateRestaurantLocationUseCase = UpdateRestaurantLocationUseCase;
