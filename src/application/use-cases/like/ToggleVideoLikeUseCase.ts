import { ILikeRepository } from '@/domain/repositories/ILikeRepository';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { Like } from '@/domain/entities/Like';

export interface ToggleVideoLikeRequest {
    videoId: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
}

export interface ToggleVideoLikeResponse {
    success: boolean;
    liked?: boolean;
    likesCount?: number;
    error?: string;
}

export class ToggleVideoLikeUseCase {
    constructor(
        private likeRepository: ILikeRepository,
        private videoRepository: IVideoRepository
    ) { }

    async execute(request: ToggleVideoLikeRequest): Promise<ToggleVideoLikeResponse> {
        try {
            // Ensure video exists
            const video = await this.videoRepository.findById(request.videoId);
            if (!video) {
                return {
                    success: false,
                    error: 'Video not found'
                };
            }

            // Check if user already liked the video
            const existingLike = await this.likeRepository.findByVideoAndUser(
                request.videoId,
                request.userId
            );

            if (existingLike) {
                // Unlike: remove the like
                await this.likeRepository.delete(existingLike.id!);

                // Decrease likes count
                const currentVideo = await this.videoRepository.findById(request.videoId);
                if (currentVideo) {
                    await this.videoRepository.update(request.videoId, {
                        likesCount: Math.max(0, (currentVideo.likesCount || 0) - 1)
                    });
                }

                const newLikesCount = await this.likeRepository.countByVideoId(request.videoId);

                return {
                    success: true,
                    liked: false,
                    likesCount: newLikesCount
                };
            } else {
                // Like: create new like
                const like: Like = {
                    videoId: request.videoId,
                    userId: request.userId,
                    userType: request.userType
                };

                await this.likeRepository.create(like);

                // Increase likes count
                const currentVideo = await this.videoRepository.findById(request.videoId);
                if (currentVideo) {
                    await this.videoRepository.update(request.videoId, {
                        likesCount: (currentVideo.likesCount || 0) + 1
                    });
                }

                const newLikesCount = await this.likeRepository.countByVideoId(request.videoId);

                return {
                    success: true,
                    liked: true,
                    likesCount: newLikesCount
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle like'
            };
        }
    }
}
