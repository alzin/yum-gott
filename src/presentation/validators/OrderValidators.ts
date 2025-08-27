import { body, param, ValidationChain } from 'express-validator';

export class OrderValidators {
    static createOrder(): ValidationChain[] {
        return [
            body('productId')
                .notEmpty()
                .withMessage('productId is required')
                .isUUID()
                .withMessage('Invalid productId format')
        ];
    }

    static orderIdParam(): ValidationChain[] {
        return [
            param('orderId')
                .isUUID()
                .withMessage('Invalid orderId format')
        ];
    }
}
