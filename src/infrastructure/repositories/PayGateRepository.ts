import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import { IPayGateRepository } from '@/domain/repositories/IPayGateRepository';
import { PayGate } from '@/domain/entities/PayGate';

function mapDbPayGate(row: any): PayGate {
    return {
        gateName: row.gate_name,
    };
}

export class PayGateRepository implements IPayGateRepository {
    constructor(private readonly db: DatabaseConnection) { }

    async findAll(): Promise<PayGate[]> {
        const sql = `SELECT gate_name FROM paygates ORDER BY gate_name ASC`;
        const result = await this.db.query(sql);
        return result.rows.map(mapDbPayGate);
    }
}


