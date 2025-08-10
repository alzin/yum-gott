import { ICommentRepository } from '@/domain/repositories/ICommentRepository';

export interface DeleteCommentRequest {
    commentId: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
}

export interface DeleteCommentResponse {
    success: boolean;
    error?: string;
}

export class DeleteCommentUseCase {
    constructor(private commentRepository: ICommentRepository) { }

    async execute(request: DeleteCommentRequest): Promise<DeleteCommentResponse> {
        try {
            // Get the comment to check ownership
            const comment = await this.commentRepository.findById(request.commentId);

            if (!comment) {
                return {
                    success: false,
                    error: 'Comment not found'
                };
            }

            // Check if user owns the comment
            if (comment.userId !== request.userId || comment.userType !== request.userType) {
                return {
                    success: false,
                    error: 'You can only delete your own comments'
                };
            }

            // Delete the comment
            const deleted = await this.commentRepository.delete(request.commentId);

            if (!deleted) {
                return {
                    success: false,
                    error: 'Failed to delete comment'
                };
            }

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete comment'
            };
        }
    }
}
