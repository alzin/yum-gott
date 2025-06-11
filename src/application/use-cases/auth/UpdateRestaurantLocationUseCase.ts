import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';
import { RestaurantOwner } from '@/domain/entities/User';

export interface UpdateRestaurantLocationRequest {
    userId: string;
    address: string;
    latitude: number;
    longitude: number;
}

export interface UpdateRestaurantLocationResponse {
    restaurantOwner: RestaurantOwner;
}

export class UpdateRestaurantLocationUseCase {
    constructor(
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(request: UpdateRestaurantLocationRequest): Promise<UpdateRestaurantLocationResponse> {
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
