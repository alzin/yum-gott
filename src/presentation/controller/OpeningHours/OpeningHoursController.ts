import { Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware';
import { CreateOpeningHoursUseCase, GetopeningHoursUseCase } from '@/application/use-cases/opening-hours';
import { UpdateOpeningHoursUseCase } from '@/application/use-cases/opening-hours/UpdateOpeningHoursUseCase';
import { DeleteOpeningHoursUseCase } from '@/application/use-cases/opening-hours/DeleteOpeningHoursUseCase';
export class OpeningHoursController {
    constructor(
        private createOpeningHoursUseCase: CreateOpeningHoursUseCase,
        private getOpeningHoursUseCase: GetopeningHoursUseCase,
        private deleteOpeningHoursUseCase: DeleteOpeningHoursUseCase,
        private updateOpeningHoursUseCase: UpdateOpeningHoursUseCase
    ) { }

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
                Working_hours: req.body.Working_hours,
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

    async deleteOpeningHours(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can delete opening hours'
                });
                return;
            }
            const { id } = req.params;
            await this.deleteOpeningHoursUseCase.execute(id, user.userId);
            res.status(200).json({
                success: true,
                message: 'Opening hours deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete opening hours'
            });
        }
    }
    async updateOpeningHours(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user || user.userType !== 'restaurant_owner') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden: Only restaurant owners can update opening hours'
                });
                return;
            }
            const { id } = req.params;
            const request = {
                id,
                day: req.body.day,
                Working_hours: req.body.Working_hours,
                isClosed: req.body.isClosed
            };
            const updated = await this.updateOpeningHoursUseCase.execute(request, user.userId);
            res.status(200).json({
                success: true,
                message: 'Opening hours updated successfully',
                data: updated
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update opening hours'
            });
        }
    }
}