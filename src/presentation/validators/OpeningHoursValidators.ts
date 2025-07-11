import { body, ValidationChain } from 'express-validator';

export class OpeningHoursValidators {
    static createOpeningHours(): ValidationChain[] {
        return [
            body('day')
                .trim()
                .notEmpty()
                .withMessage('Day is required')
                .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
                .withMessage('Invalid day'),
            body('Working_hours')
                .if(body('isClosed').equals('false'))
                .isArray({ min: 1 })
                .withMessage('Working_hours must be a non-empty array when isClosed is false'),
            body('Working_hours.*.startTime')
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('Each working hour period must have startTime')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('startTime must be in HH:mm:ss format (e.g., 09:00:00)'),
            body('Working_hours.*.endTime')
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('Each working hour period must have endTime')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('endTime must be in HH:mm:ss format (e.g., 18:00:00)'),
            body('isClosed')
                .isBoolean()
                .withMessage('isClosed must be a boolean'),
            body().custom((value) => {
                if (value.isClosed && value.Working_hours && value.Working_hours.length > 0) {
                    throw new Error('Working_hours should be empty when isClosed is true');
                }
                return true;
            })
        ];
    }
}