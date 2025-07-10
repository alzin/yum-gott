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
            body('startTime')
                .optional()
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('Start time must be in HH:mm:ss format (e.g., 09:00:00)'),
            body('endTime')
                .optional()
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('End time must be in HH:mm:ss format (e.g., 18:00:00)'),
            body('isClosed')
                .isBoolean()
                .withMessage('isClosed must be a boolean'),
            body().custom((value) => {
                if (!value.isClosed && (!value.startTime || !value.endTime)) {
                    throw new Error('Start and end times are required when isClosed is false');
                }
                if (value.isClosed && (value.startTime || value.endTime)) {
                    throw new Error('Start and end times should not be provided when isClosed is true');
                }
                return true;
            })
        ];
    }
}