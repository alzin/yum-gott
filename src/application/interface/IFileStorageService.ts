export interface IFileStorageService {
    UploadImageProfile(file: Express.Multer.File, userId: string, userType: 'customer' | 'restaurant_owner'): Promise<string>;
    UploadProductImage(
        file: Express.Multer.File,
        id: string,
        type: 'restaurant_owner' | 'product' | 'invoiceImage',
        existingUrl?: string
    ): Promise<string>;
    DeleteOldImage(fileUrl: string): Promise<void>;
}