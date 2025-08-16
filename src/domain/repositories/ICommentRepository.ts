import { Comment } from '../entities/Comment';

export interface ICommentRepository {
    create(comment: Comment): Promise<Comment>;
    findById(id: string): Promise<Comment | null>;
    findByVideoId(videoId: string): Promise<Comment[]>;
    findByUserId(userId: string): Promise<Comment[]>;
    update(id: string, comment: Partial<Comment>): Promise<Comment | null>;
    delete(id: string): Promise<boolean>;
    countByVideoId(videoId: string): Promise<number>;
    deleteByUser(userId: string, userType: 'customer' | 'restaurant_owner'): Promise<number>;
}
