import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware';
import { CreateOpeningHoursUseCase, GetopeningHoursUseCase } from '@/application/use-cases/opening-hours';

export class OpeningHoursController {
    constructor(
        private createOpeningHoursUseCase: CreateOpeningHoursUseCase,
        private getOpeningHoursUseCase: GetopeningHoursUseCase
    ) {}

    async createOpeningHours(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can create opening hours'
                });
                return;
            }

            const request = {
                day: req.body.day,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                isClosed: req.body.isClosed
            };

            const openingHours = await this.createOpeningHoursUseCase.execute(request, user.userId);
            res.status(201).json({
                success: true,
                message: 'Opening hours created successfully',
                data: openingHours
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create opening hours'
            });
        }
    }

    async getOpeningHours(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can view opening hours'
                });
                return;
            }

            const openingHours = await this.getOpeningHoursUseCase.execute(user.userId);
            res.status(200).json({
                success: true,
                message: 'Opening hours retrieved successfully',
                data: openingHours
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve opening hours'
            });
        }
    }
}