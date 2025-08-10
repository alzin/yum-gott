export interface Comment {
    id?: string;
    videoId: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}
