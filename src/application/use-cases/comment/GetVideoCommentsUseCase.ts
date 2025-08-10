import { ICommentRepository } from '@/domain/repositories/ICommentRepository';
import { Comment } from '@/domain/entities/Comment';

export interface GetVideoCommentsRequest {
    videoId: string;
}

export interface GetVideoCommentsResponse {
    success: boolean;
    comments?: Comment[];
    error?: string;
}

export class GetVideoCommentsUseCase {
    constructor(private commentRepository: ICommentRepository) { }

    async execute(request: GetVideoCommentsRequest): Promise<GetVideoCommentsResponse> {
        try {
            const comments = await this.commentRepository.findByVideoId(request.videoId);

            return {
                success: true,
                comments
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch comments'
            };
        }
    }
}
