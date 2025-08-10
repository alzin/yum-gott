import { Request, Response } from 'express';
import { GetActivePayGatesUseCase } from '@/application/use-cases/paygate/GetActivePayGatesUseCase';

export class PayGateController {
    constructor(private readonly getActivePayGatesUseCase: GetActivePayGatesUseCase) { }

    async listActive(_: Request, res: Response): Promise<void> {
        try {
            const result = await this.getActivePayGatesUseCase.execute();
            res.status(200).json({ success: true, message: 'Active pay gates', data: result.payGates });
        } catch (error) {
            console.error('Error fetching pay gates:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}


