import { DIContainer } from '../DIContainer';
import { PasswordHasher, EmailService, FileStorageService, SocketGateway } from '../../services/index';

export function registerServices(container: DIContainer) {
    container.registerSingleton('passwordHasher', () => {
        return new PasswordHasher();
    });

    container.registerSingleton('emailService', () => {
        return new EmailService();
    });

    container.registerSingleton('fileStorageService', () => {
        return new FileStorageService();
    });

    container.registerSingleton('realtimeNotifier', () => {
        return new SocketGateway();
    });
} 