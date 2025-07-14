export interface MediaAsset{
    id?: number,
    userId:number,
    restaurantName:string,
    receiptUrl: string;
    network: 'mtn' | 'syriatel';
    phoneNumber: string;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    status: 'pending' | 'accept' | 'rejected';
    createdAt: Date;
}