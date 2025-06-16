import { IRestaurantOwnerRepository } from '@/domain/repositories/IRestaurantOwnerRepository';

export class GetRestaurantOwnerProfileUseCase {
  constructor(private restaurantOwnerRepository: IRestaurantOwnerRepository) {}

  async execute(userId: string) {
    try {
      const profile = await this.restaurantOwnerRepository.getRestaurantOwnerProfile(userId);
      return {
        success: true,
        data: profile
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch restaurant owner profile'
      };
    }
  }
}
