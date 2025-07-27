import { Video, VideoStatus } from "../entities/Videos";
export interface IVideoRepository {
    create(video: Video): Promise<Video>;
    update(id: string, video: Partial<Video>): Promise<Video>;
    findById(id: string): Promise<Video | null>;
    findByStatusVideo(statusVideo: VideoStatus): Promise<Video[]>;
    findBySecureUrl(secureUrl: string): Promise<Video | null>;
    delete(id: string): Promise<void>;
}