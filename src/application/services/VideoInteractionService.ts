import { ICommentRepository } from '@/domain/repositories/ICommentRepository';
import { ILikeRepository } from '@/domain/repositories/ILikeRepository';
import { IVideoRepository } from '@/domain/repositories/IVideoRepository';
// import { Comment } from '@/domain/entities/Comment';
// import { Like } from '@/domain/entities/Like';

export interface VideoInteractionStats {
    likesCount: number;
    commentsCount: number;
    isLikedByUser: boolean;
}

export class VideoInteractionService {
    constructor(
        private commentRepository: ICommentRepository,
        private likeRepository: ILikeRepository,
        private videoRepository: IVideoRepository
    ) { }

    async getVideoInteractionStats(
        videoId: string,
        userId?: string
    ): Promise<VideoInteractionStats> {
        const [likesCount, commentsCount, isLikedByUser] = await Promise.all([
            this.likeRepository.countByVideoId(videoId),
            this.commentRepository.countByVideoId(videoId),
            userId ? this.likeRepository.existsByVideoAndUser(videoId, userId) : Promise.resolve(false)
        ]);

        return {
            likesCount,
            commentsCount,
            isLikedByUser
        };
    }

    async getVideoWithInteractions(videoId: string, userId?: string) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) {
            return null;
        }

        const [comments, likes, isLikedByUser] = await Promise.all([
            this.commentRepository.findByVideoId(videoId),
            this.likeRepository.findByVideoId(videoId),
            userId ? this.likeRepository.existsByVideoAndUser(videoId, userId) : Promise.resolve(false)
        ]);

        return {
            ...video,
            comments,
            likes,
            isLikedByUser
        };
    }

    async deleteVideoInteractions(videoId: string): Promise<void> {
        await Promise.all([
            this.likeRepository.deleteByVideoAndUser(videoId, ''),
            this.commentRepository.delete(videoId)
        ]);
    }
}
