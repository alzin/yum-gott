import { ILikeRepository } from '@/domain/repositories/ILikeRepository';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
import { Like } from '@/domain/entities/Like';

export interface GetVideoLikesRequest {
    videoId: string;
}

export interface GetVideoLikesResponse {
    success: boolean;
    likes?: Like[];
    likesCount?: number;
    error?: string;
}

export class GetVideoLikesUseCase {
    constructor(
        private likeRepository: ILikeRepository,
        private videoRepository: IVideoRepository
    ) { }

    async execute(request: GetVideoLikesRequest): Promise<GetVideoLikesResponse> {
        try {
            // Ensure video exists
            const video = await this.videoRepository.findById(request.videoId);
            if (!video) {
                return {
                    success: false,
                    error: 'Video not found'
                };
            }

            const [likes, likesCount] = await Promise.all([
                this.likeRepository.findByVideoId(request.videoId),
                this.likeRepository.countByVideoId(request.videoId)
            ]);

            return {
                success: true,
                likes,
                likesCount
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch likes'
            };
        }
    }
}
