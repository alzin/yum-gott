"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
class SchedulerService {
    constructor(cleanupUnverifiedAccountsUseCase) {
        this.cleanupUnverifiedAccountsUseCase = cleanupUnverifiedAccountsUseCase;
        this.cleanupInterval = null;
    }
    startScheduledJobs() {
        // Run cleanup every 24 hours (24 * 60 * 60 * 1000 milliseconds)
        this.cleanupInterval = setInterval(async () => {
            try {
                const result = await this.cleanupUnverifiedAccountsUseCase.execute();
                console.log(`Cleanup completed: ${result.customerCount} customers and ${result.restaurantOwnerCount} restaurant owners removed`);
            }
            catch (error) {
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
    stopScheduledJobs() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}
exports.SchedulerService = SchedulerService;
