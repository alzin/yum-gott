export interface IFileStorageService {
    uploadFile(file: Express.Multer.File, userId: string, userType: 'customer' | 'restaurant_owner'): Promise<string>;
    uploadProductFile(
        file: Express.Multer.File, 
        id: string, 
        type:  'restaurant_owner' | 'product',
        existingUrl?: string
    ): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}