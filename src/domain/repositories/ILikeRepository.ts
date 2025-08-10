import { Like } from '../entities/Like';

export interface ILikeRepository {
    create(like: Like): Promise<Like>;
    findById(id: string): Promise<Like | null>;
    findByVideoId(videoId: string): Promise<Like[]>;
    findByUserId(userId: string): Promise<Like[]>;
    findByVideoAndUser(videoId: string, userId: string): Promise<Like | null>;
    delete(id: string): Promise<boolean>;
    deleteByVideoAndUser(videoId: string, userId: string): Promise<boolean>;
    countByVideoId(videoId: string): Promise<number>;
    existsByVideoAndUser(videoId: string, userId: string): Promise<boolean>;
}
