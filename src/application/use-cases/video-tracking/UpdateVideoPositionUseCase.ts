import { IUpdateVideoPositionUseCase, UpdateVideoPositionRequest, UpdateVideoPositionResponse } from '../../interface/IUpdateVideoPositionUseCase';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IRestaurantOwnerRepository } from '../../../domain/repositories/IRestaurantOwnerRepository';
import { IVideoRepository } from '../../../domain/repositories/IVideoRepository';

export class UpdateVideoPositionUseCase implements IUpdateVideoPositionUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository,
        private videoRepository: IVideoRepository
    ) { }

    async execute(request: UpdateVideoPositionRequest): Promise<UpdateVideoPositionResponse> {
        const { userId, lastVideoId } = request;

        // Verify the video exists
        const video = await this.videoRepository.findById(lastVideoId);
        if (!video) {
            throw new Error('Video not found');
        }

        // Find user and update their last seen video
        const customer = await this.customerRepository.findById(userId);
        const restaurantOwner = await this.restaurantOwnerRepository.findById(userId);

        if (!customer && !restaurantOwner) {
            throw new Error('User not found');
        }

        if (customer) {
            await this.customerRepository.updateLastSeenVideo(userId, lastVideoId);
        } else if (restaurantOwner) {
            await this.restaurantOwnerRepository.updateLastSeenVideo(userId, lastVideoId);
        }

        return {
            success: true,
            message: 'Video position updated successfully'
        };
    }
} 