import { OpeningHours } from "../entities";
export interface IOpeningHoursRepository {
    create(openingHours: OpeningHours): Promise<OpeningHours>;
    update(id: string, openingHours: Partial<OpeningHours>): Promise<OpeningHours>;
    findById(id: string): Promise<OpeningHours | null>;
    findByRestaurantOwnerId(restaurantOwnerId: string): Promise<OpeningHours[]>;
    delete(id: string): Promise<void>;
    findByDayAndRestaurantOwnerId(day: string, restaurantOwnerId: string): Promise<OpeningHours | null>;
}