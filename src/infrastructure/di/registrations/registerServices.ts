import { DIContainer } from '../DIContainer';
import { PasswordHasher, EmailService, FileStorageService } from '../../services/index';

export function registerServices(container: DIContainer) {
    container.registerSingleton('passwordHasher', () => {
        console.log('DIContainer: Registering passwordHasher');
        return new PasswordHasher();
    });

    container.registerSingleton('emailService', () => {
        console.log('DIContainer: Registering emailService');
        return new EmailService();
    });

    container.registerSingleton('fileStorageService', () => {
        console.log('DIContainer: Registering fileStorageService');
        return new FileStorageService();
    });
} 