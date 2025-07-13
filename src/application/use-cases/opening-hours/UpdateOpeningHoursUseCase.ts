import { OpeningHours } from "@/domain/entities";
import { IOpeningHoursRepository, IRestaurantOwnerRepository } from "@/domain/repositories";

export interface UpdateOpeningHoursRequest {
    id: string;
    day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    Working_hours?: { startTime: string; endTime: string }[];
    isClosed?: boolean;
}

export class UpdateOpeningHoursUseCase {
    constructor(
        private openingHoursRepository: IOpeningHoursRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }

    async execute(request: UpdateOpeningHoursRequest, restaurantOwnerId: string): Promise<OpeningHours> {
        const { id, day, Working_hours, isClosed } = request;
        const entry = await this.openingHoursRepository.findById(id);
        if (!entry) {
            throw new Error('Opening hours entry not found');
        }
        if (entry.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('You are not authorized to update this entry');
        }

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        if (isClosed === false) {
            if (!Working_hours || Working_hours.length === 0) {
                throw new Error('At least one working hour period is required when not closed');
            }
            for (const period of Working_hours) {
                if (!period.startTime || !period.endTime) {
                    throw new Error('Each working hour period must have startTime and endTime');
                }
            }
        }
        if (isClosed === true && Working_hours && Working_hours.length > 0) {
            throw new Error('Working_hours should be empty when isClosed is true');
        }
        // Prepare update object
        let openingHoursUpdate: Partial<OpeningHours>;
        if (isClosed === true) {
            openingHoursUpdate = {
                ...(day !== undefined ? { day } : {}),
                Working_hours: [],
                isClosed: true,
                updatedAt: new Date(),
            };
        } else {
            openingHoursUpdate = {
                ...(day !== undefined ? { day } : {}),
                ...(Working_hours !== undefined ? { Working_hours } : {}),
                ...(isClosed !== undefined ? { isClosed } : {}),
                updatedAt: new Date(),
            };
        }
        const updated = await this.openingHoursRepository.update(id, openingHoursUpdate);
        return updated;
    }
}