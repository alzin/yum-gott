import { IOpeningHoursRepository } from '@/domain/repositories';

export class DeleteOpeningHoursUseCase {
    constructor(private openingHoursRepository: IOpeningHoursRepository) { }

    async execute(id: string, restaurantOwnerId: string): Promise<void> {
        // Optionally, check if the entry belongs to the restaurant owner
        const entry = await this.openingHoursRepository.findById(id);
        if (!entry) {
            throw new Error('Opening hours entry not found');
        }
        if (entry.restaurantOwnerId !== restaurantOwnerId) {
            throw new Error('You are not authorized to delete this entry');
        }
        await this.openingHoursRepository.delete(id);
    }
} 