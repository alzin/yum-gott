import { IOpeningHoursRepository, IRestaurantOwnerRepository } from "@/domain/repositories";
import { OpeningHours } from "@/domain/entities";
export class GetopeningHoursUseCase {
    constructor(
        private openingHoursRepository: IOpeningHoursRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }
    async execute(restaurantOwnerId: string): Promise<OpeningHours[]> {
        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error("Restaurant owner not found")
        }
        return await this.openingHoursRepository.findByRestaurantOwnerId(restaurantOwnerId)
    }
}
