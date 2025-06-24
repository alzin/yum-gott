import { CleanupUnverifiedAccountsUseCase } from '@/application/use-cases/auth/index';

export class CleanupUnverifiedAccounts {
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(
        private cleanupUnverifiedAccountsUseCase: CleanupUnverifiedAccountsUseCase
    ) {}

    startScheduledJobs(): void {
        this.cleanupInterval = setInterval(async () => {
            try {
                const result = await this.cleanupUnverifiedAccountsUseCase.execute();
                console.log(`Cleanup completed: ${result.customerCount} customers and ${result.restaurantOwnerCount} restaurant owners removed`);
            } catch (error) {
                console.error('Error during scheduled cleanup:', error);
            }
        }, 24 * 60 * 60 * 1000);

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
