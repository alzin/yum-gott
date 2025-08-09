import { Video, VideoStatus } from "../entities/Videos";

export interface PaginationParams {
    limit?: number;
    cursor?: string;
    cursor_created?: string; // ISO8601 date string
    cursor_id?: string; // UUID or string
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
    findByStatusVideoPaginated(statusVideo: VideoStatus, pagination: PaginationParams): Promise<PaginatedVideosResult>;
    findBySecureUrl(secureUrl: string): Promise<Video | null>;
    findByCustomerIdAndStatus(customerId: string, status: VideoStatus): Promise<Video[]>;
    getVideosAfterId(lastSeenVideoId: string | null, limit: number, cursor?: string): Promise<Video[]>;
    delete(id: string): Promise<void>;
    findAllAcceptedVideos(): Promise<Video[]>;
}