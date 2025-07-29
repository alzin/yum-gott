
import { RestaurantOwner } from '../entities/User';

export interface IRestaurantOwnerRepository {
    create(restaurantOwner: RestaurantOwner): Promise<RestaurantOwner>;
    verifyEmail(token: string): Promise<RestaurantOwner>;
    findById(id: string): Promise<RestaurantOwner | null>;
    findByEmail(email: string): Promise<RestaurantOwner | null>;
    update(id: string, restaurantOwner: Partial<RestaurantOwner>): Promise<RestaurantOwner>;
    delete(id: string): Promise<void>;
    existsByEmail(email: string): Promise<boolean>;
    existsByOrganizationNumber(organizationNumber: string): Promise<boolean>;
    updateProfileImage(id: string, profileImage: string): Promise<RestaurantOwner>;
    updateLocation(id: string, location: { address: string; latitude: number; longitude: number }): Promise<RestaurantOwner>;
    deleteUnverifiedOlderThan(date: Date): Promise<number>;
    getRestaurantOwnerProfile(id: string): Promise<{ restaurantName: string; profileImageUrl: string | null; isActive: boolean }>;
}
