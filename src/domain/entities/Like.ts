export interface Like {
    id?: string;
    videoId: string;
    userId: string;
    userType: 'customer' | 'restaurant_owner';
    createdAt?: Date;
}
