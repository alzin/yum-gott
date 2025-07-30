import { Video, VideoStatus } from "../entities/Videos";

export interface PaginationParams {
    limit?: number;
    cursor?: string;
}

export interface PaginatedVideosResult {
    videos: Video[];
    nextCursor?: string;
    hasMore: boolean;
}

export interface IVideoRepository {
    create(video: Video): Promise<Video>;
    update(id: string, video: Partial<Video>): Promise<Video>;
    findById(id: string): Promise<Video | null>;
    findByStatusVideo(statusVideo: VideoStatus): Promise<Video[]>;
    findByStatusVideoPaginated(statusVideo: VideoStatus, pagination: PaginationParams): Promise<PaginatedVideosResult>;
    findBySecureUrl(secureUrl: string): Promise<Video | null>;
    delete(id: string): Promise<void>;
}