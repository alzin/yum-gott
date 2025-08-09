import { IVideoFeedUseCase, VideoFeedRequest, VideoFeedResponse } from '../../interface/IVideoFeedUseCase';
import { IVideoRepository } from '../../../domain/repositories/IVideoRepository';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { IRestaurantOwnerRepository } from '../../../domain/repositories/IRestaurantOwnerRepository';

export class GetVideoFeedUseCase implements IVideoFeedUseCase {
    constructor(
        private videoRepository: IVideoRepository,
        private customerRepository: ICustomerRepository,
        private restaurantOwnerRepository: IRestaurantOwnerRepository
    ) { }

    async execute(request: VideoFeedRequest): Promise<VideoFeedResponse> {
        const { userId, limit = 10, cursor } = request;

        // Get user's last seen video ID
        const customer = await this.customerRepository.findById(userId);
        const restaurantOwner = await this.restaurantOwnerRepository.findById(userId);

        if (!customer && !restaurantOwner) {
            throw new Error('User not found');
        }

        const user = customer || restaurantOwner;
        const lastSeenVideoId = user?.lastSeenVideoId;

        // Get videos after the last seen video (or from beginning if no last seen)
        const videos = await this.videoRepository.getVideosAfterId(
            lastSeenVideoId ?? null,
            limit + 1, // Get one extra to check if there are more
            cursor
        );

        const hasMore = videos.length > limit;
        const videosToReturn = hasMore ? videos.slice(0, limit) : videos;
        const nextCursor = hasMore ? videos[limit - 1]?.id : undefined;

        return {
            videos: videosToReturn.map(video => ({
                id: video.id!,
                userId: video.userId,
                publicId: video.publicId,
                secureUrl: video.secureUrl,
                restaurantName: video.restaurantName,
                phoneNumber: video.phoneNumber,
                network: video.network,
                invoiceImage: video.invoiceImage,
                statusVideo: video.statusVideo,
                createdAt: video.createdAt!
            })),
            nextCursor,
            hasMore
        };
    }
} 