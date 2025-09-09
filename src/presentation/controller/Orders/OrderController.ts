import { Request, Response } from 'express';
import { CreateOrderUseCase, GetOrdersForCustomerUseCase, GetOrderByIdUseCase } from '@/application/use-cases/order';

export class OrderController {
    constructor(
        private createOrderUseCase: CreateOrderUseCase,
        private getOrdersForCustomerUseCase: GetOrdersForCustomerUseCase,
        private getOrderByIdUseCase: GetOrderByIdUseCase
    ) { }

    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const { customerId, productIds, optionIds = [], valueIds = [] } = req.body || {};

            if (!customerId) {
                res.status(400).json({ success: false, message: 'customerId is required' });
                return;
            }

            const order = await this.createOrderUseCase.execute({
                customerId,
                productIds,
                optionIds,
                valueIds
            });

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to create order' });
        }
    }

    async getOrdersForCustomer(req: Request, res: Response): Promise<void> {
        try {
            const customerId = (req as any).user?.userId;
            if (!customerId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const orders = await this.getOrdersForCustomerUseCase.execute(customerId);
            res.status(200).json({ success: true, message: 'Orders retrieved', data: orders });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to get orders' });
        }
    }

    async getOrderById(req: Request, res: Response): Promise<void> {
        try {
            const { orderId } = req.params;
            const order = await this.getOrderByIdUseCase.execute(orderId);
            if (!order) {
                res.status(404).json({ success: false, message: 'Order not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Order retrieved', data: order });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to get order' });
        }
    }
}
