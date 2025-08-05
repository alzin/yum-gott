import { IRestaurantOwnerRepository } from "@/domain/repositories/IRestaurantOwnerRepository";

export class DeleteRestaurantOwnerAccountUseCase {
    constructor(private restaurantOwnerRepository: IRestaurantOwnerRepository) { }

    async execute(restaurantOwnerId: string): Promise<void> {
        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        await this.restaurantOwnerRepository.delete(restaurantOwnerId);
    }
} 