import { OpeningHours } from '@/domain/entities/OpeningHours';
import { IOpeningHoursRepository, IRestaurantOwnerRepository } from '@/domain/repositories';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOpeningHoursRequest {
    day: string;
    startTime?: string;
    endTime?: string;
    isClosed: boolean;
}

export class CreateOpeningHoursUseCase {
    constructor(
        private openingHoursRepository: IOpeningHoursRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) {}

    async execute(request: CreateOpeningHoursRequest, restaurantOwnerId: string): Promise<OpeningHours> {
        const { day, startTime, endTime, isClosed } = request;

        const restaurantOwner = await this.restaurantOwnerRepository.findById(restaurantOwnerId);
        if (!restaurantOwner) {
            throw new Error('Restaurant owner not found');
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(day)) {
            throw new Error('Invalid day');
        }

        const existingHours = await this.openingHoursRepository.findByDayAndRestaurantOwnerId(day, restaurantOwnerId);
        if (existingHours) {
            throw new Error(`Opening hours already defined for ${day}`);
        }

        if (!isClosed && (!startTime || !endTime)) {
            throw new Error('Start and end times are required when not closed');
        }

        const openingHours: OpeningHours = {
            id: uuidv4(),
            restaurantOwnerId,
            day,
            startTime: isClosed ? undefined : startTime,
            endTime: isClosed ? undefined : endTime,
            isClosed,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.openingHoursRepository.create(openingHours);
    }
}