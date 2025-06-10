import { CleanupUnverifiedAccountsUseCase } from '@/application/use-cases/auth/index';

export class SchedulerService {
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(
        private cleanupUnverifiedAccountsUseCase: CleanupUnverifiedAccountsUseCase
    ) {}

    startScheduledJobs(): void {
        // Run cleanup every 24 hours (24 * 60 * 60 * 1000 milliseconds)
        this.cleanupInterval = setInterval(async () => {
            try {
                const result = await this.cleanupUnverifiedAccountsUseCase.execute();
                console.log(`Cleanup completed: ${result.customerCount} customers and ${result.restaurantOwnerCount} restaurant owners removed`);
            } catch (error) {
                console.error('Error during scheduled cleanup:', error);
            }
        }, 24 * 60 * 60 * 1000);

        // Run immediately on startup
        this.cleanupUnverifiedAccountsUseCase.execute()
            .then(result => {
                console.log(`Initial cleanup completed: ${result.customerCount} customers and ${result.restaurantOwnerCount} restaurant owners removed`);
            })
            .catch(error => {
                console.error('Error during initial cleanup:', error);
            });
    }

    stopScheduledJobs(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}
