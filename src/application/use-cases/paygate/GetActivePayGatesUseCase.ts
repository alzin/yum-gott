import { IPayGateRepository } from '@/domain/repositories/IPayGateRepository';
import { PayGate } from '@/domain/entities/PayGate';

export class GetActivePayGatesUseCase {
    constructor(private readonly payGateRepository: IPayGateRepository) { }

    async execute(): Promise<{ payGates: string[] }> {
        const rows = await this.payGateRepository.findAll();
        return { payGates: rows.map(r => r.gateName) };
    }
}


