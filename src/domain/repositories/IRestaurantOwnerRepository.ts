import { RestaurantOwner } from '../entities/User';

export interface IRestaurantOwnerRepository {
    create(restaurantOwner: RestaurantOwner): Promise<RestaurantOwner>;
    findByMobileNumber(mobileNumber: string): Promise<RestaurantOwner | null>;
    findById(id: string): Promise<RestaurantOwner | null>;
    findByEmail(email: string): Promise<RestaurantOwner | null>;
    update(id: string, restaurantOwner: Partial<RestaurantOwner>): Promise<RestaurantOwner>;
    delete(id: string): Promise<void>;
    existsByMobileNumber(mobileNumber: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    existsByOrganizationNumber(organizationNumber: string): Promise<boolean>;
}
