import { IRestaurantOwnerRepository } from "@/domain/repositories/IRestaurantOwnerRepository";
import { ICommentRepository } from "@/domain/repositories/ICommentRepository";

export class DeleteRestaurantOwnerAccountUseCase {
    constructor(
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private commentRepository: ICommentRepository
    ) { }

    async execute(restaurantOwnerId: string): Promise<void> {
        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        // Delete user's comments first
        await this.commentRepository.deleteByUser(restaurantOwnerId, 'restaurant_owner');

        // Then delete the restaurant owner account
        await this.restaurantOwnerRepository.delete(restaurantOwnerId);
    }
} 