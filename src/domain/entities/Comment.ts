export interface Comment {
    id?: string;
    videoId: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
    userName?: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}
