export interface IFileStorageService {
    uploadFile(file: Express.Multer.File, userId: string, userType: 'customer' | 'restaurant_owner'): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    uploadFile(file: Express.Multer.File, userId: string, userType: 'customer' | 'restaurant_owner' | 'product'): Promise<string>;
    // deleteFile(fileUrl: string): Promise<void>;
}