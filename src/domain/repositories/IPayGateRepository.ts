import { PayGate } from '@/domain/entities/PayGate';

export interface IPayGateRepository {
    findAll(): Promise<PayGate[]>;
}


