import { Request, Response } from 'express';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { CreateOrderUseCase, GetOrdersForCustomerUseCase, GetOrderByIdUseCase } from '@/application/use-cases/order';

export class OrderController {
    private di = DIContainer.getInstance();

    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const { productId, selectedOptions = [] } = req.body || {};
            const customerId = (req as any).user?.userId;
            
            if (!customerId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            
            if (!productId) {
                res.status(400).json({ success: false, message: 'productId is required' });
                return;
            }

            // Validate selectedOptions structure if provided
            if (selectedOptions && !Array.isArray(selectedOptions)) {
                res.status(400).json({ 
                    success: false, 
                    message: 'selectedOptions must be an array of {optionId: string, valueId: string}' 
                });
                return;
            }
            const useCase = this.di.resolve('createOrderUseCase') as CreateOrderUseCase;
            const order = await useCase.execute({ 
                customerId, 
                productId,
                selectedOptions: selectedOptions || []
            });
            
            res.status(201).json({ 
                success: true, 
                message: 'Order created', 
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
            const useCase = this.di.resolve('getOrdersForCustomerUseCase') as GetOrdersForCustomerUseCase;
            const orders = await useCase.execute(customerId);
            res.status(200).json({ success: true, message: 'Orders retrieved', data: orders });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to get orders' });
        }
    }

    async getOrderById(req: Request, res: Response): Promise<void> {
        try {
            const { orderId } = req.params;
            const useCase = this.di.resolve('getOrderByIdUseCase') as GetOrderByIdUseCase;
            const order = await useCase.execute(orderId);
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
