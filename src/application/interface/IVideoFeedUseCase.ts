export interface VideoFeedRequest {
    userId: string;
    limit?: number;
    cursor?: string;
}

export interface VideoFeedResponse {
    videos: Array<{
        id: string;
        userId: string;
        publicId: string;
        secureUrl: string;
        restaurantName: string;
        phoneNumber: string;
        network: string;
        invoiceImage: string;
        statusVideo: string;
        createdAt: Date;
    }>;
    nextCursor?: string;
    hasMore: boolean;
}

export interface IVideoFeedUseCase {
    execute(request: VideoFeedRequest): Promise<VideoFeedResponse>;
} 