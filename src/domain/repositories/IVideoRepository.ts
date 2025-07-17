import { Video } from "../entities/Videos";
export interface IVideoRepository {
    create(video: Video): Promise<Video>;
    findById(id: string): Promise<Video | null>;
    findByUserId(userId: string): Promise<Video[]>;
}