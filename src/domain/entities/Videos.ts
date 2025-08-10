export enum VideoStatus {
    PENDING = 'pending',
    REJECTED = 'rejected',
    ACCEPTED = 'accepted'
}

export enum Network {
    MTN = 'MTN',
    SYRIATEL = 'Syriatel'
}

export interface Video {
    id?: string;
    userId: string;
    publicId: string;
    secureUrl: string;
    restaurantName: string;
    phoneNumber: string;
    network: Network;
    invoiceImage: string;
    statusVideo: VideoStatus;
    likesCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}