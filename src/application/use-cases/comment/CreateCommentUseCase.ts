import { ICommentRepository } from '@/domain/repositories/ICommentRepository';
import { Comment } from '@/domain/entities/Comment';

export interface CreateCommentRequest {
    videoId: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
    content: string;
}

export interface CreateCommentResponse {
    success: boolean;
    comment?: Comment;
    error?: string;
}

export class CreateCommentUseCase {
    constructor(private commentRepository: ICommentRepository) { }

    async execute(request: CreateCommentRequest): Promise<CreateCommentResponse> {
        try {
            // Assumes request has been validated in the presentation layer

            // Create comment
            const comment: Comment = {
                videoId: request.videoId,
                userId: request.userId,
                userType: request.userType,
                content: request.content.trim()
            };

            const createdComment = await this.commentRepository.create(comment);

            return {
                success: true,
                comment: createdComment
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create comment'
            };
        }
    }
}
