import { OpeningHours, OpeningHoursPeriod } from '@/domain/entities/OpeningHours';
import { IOpeningHoursRepository, IRestaurantOwnerRepository } from '@/domain/repositories';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOpeningHoursRequest {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    Working_hours: OpeningHoursPeriod[];
    isClosed: boolean;
}

export class CreateOpeningHoursUseCase {
    constructor(
        private openingHoursRepository: IOpeningHoursRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }

    async execute(request: CreateOpeningHoursRequest, restaurantOwnerId: string): Promise<OpeningHours> {
        const { day, Working_hours, isClosed } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        // Check if the restaurant already has opening hours for this day
        if (await this.openingHoursRepository.hasOpeningHoursForDay(restaurantOwnerId, day)) {
            throw new Error('The restaurant already has opening hours for this day.');
        }

        // const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        // if (!validDays.includes(day)) {
        //     throw new Error('Invalid day');
        // }

        if (!isClosed) {
            if (!Working_hours || Working_hours.length === 0) {
                throw new Error('At least one working hour period is required when not closed');
            }
            for (const period of Working_hours) {
                if (!period.startTime || !period.endTime) {
                    throw new Error('Each working hour period must have startTime and endTime');
                }
            }
        }


        const openingHours: OpeningHours = {
            id: uuidv4(),
            restaurantOwnerId,
            day,
            Working_hours: isClosed ? [] : Working_hours,
            isClosed,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.openingHoursRepository.create(openingHours);
    }
}