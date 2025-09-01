import { DatabaseConnection } from '../database/DataBaseConnection';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

export class OrderRepository implements IOrderRepository {
    constructor(private db: DatabaseConnection) { }

    async create(order: Order): Promise<Order> {
        const query = `
            INSERT INTO orders (customer_id, product_details, order_date, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;
        const values = [
            order.customerId,
            JSON.stringify(order.product),
            order.orderDate,
            order.status
        ];
        const result = await this.db.query(query, values);
        return this.mapToOrder(result.rows[0]);
    }

    async findById(id: string): Promise<Order | null> {
        const result = await this.db.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        return this.mapToOrder(result.rows[0]);
    }

    async findByCustomerId(customerId: string): Promise<Order[]> {
        const result = await this.db.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
        return result.rows.map(this.mapToOrder);
    }

    async update(id: string, order: Partial<Order>): Promise<Order> {
        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;
        if (order.status !== undefined) { fields.push(`status = $${i++}`); values.push(order.status); }
        if (order.product !== undefined) { fields.push(`product_details = $${i++}`); values.push(JSON.stringify(order.product)); }
        if (order.orderDate !== undefined) { fields.push(`order_date = $${i++}`); values.push(order.orderDate); }
        fields.push(`updated_at = NOW()`);
        values.push(id);
        const query = `UPDATE orders SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
        const result = await this.db.query(query, values);
        if (result.rows.length === 0) throw new Error('Order not found');
        return this.mapToOrder(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        await this.db.query('DELETE FROM orders WHERE id = $1', [id]);
    }

    private mapToOrder = (row: any): Order => ({
        id: row.id,
        customerId: row.customer_id,
        product: row.product_details,
        orderDate: new Date(row.order_date),
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });
}
