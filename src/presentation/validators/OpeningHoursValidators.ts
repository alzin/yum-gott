import { body, ValidationChain } from 'express-validator';

export class OpeningHoursValidators {
    static createOpeningHours(): ValidationChain[] {
        return [
            body('day')
                .trim()
                .notEmpty()
                .withMessage('Please select a day of the week')
                .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
                .withMessage('Please select a valid day of the week'),
            body('Working_hours')
                .if(body('isClosed').equals('false'))
                .isArray({ min: 1 })
                .withMessage('Please add at least one working hour period when the business is open'),
            body('Working_hours.*.startTime')
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('Please enter a start time for each working period')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('Start time must be in HH:mm:ss format (e.g., 09:00:00)'),
            body('Working_hours.*.endTime')
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('Please enter an end time for each working period')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('End time must be in HH:mm:ss format (e.g., 18:00:00)'),
            body('isClosed')
                .isBoolean()
                .withMessage('Please specify whether the business is closed (true or false)'),
            body().custom((value) => {
                if (value.isClosed && value.Working_hours && value.Working_hours.length > 0) {
                    throw new Error('Working_hours should be empty when isClosed is true');
                }
                return true;
            })
        ];
    }

    static updateOpeningHours(): ValidationChain[] {
        return [
            body('day')
                .optional()
                .trim()
                .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
                .withMessage('Please select a valid day of the week'),
            body('Working_hours')
                .optional()
                .if(body('isClosed').equals('false'))
                .isArray({ min: 1 })
                .withMessage('Please add at least one working hour period when the business is open'),
            body('Working_hours.*.startTime')
                .optional()
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('Please enter a start time for each working period')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('Start time must be in HH:mm:ss format (e.g., 09:00:00)'),
            body('Working_hours.*.endTime')
                .optional()
                .if(body('isClosed').equals('false'))
                .notEmpty()
                .withMessage('Please enter an end time for each working period')
                .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
                .withMessage('End time must be in HH:mm:ss format (e.g., 18:00:00)'),
            body('isClosed')
                .optional()
                .isBoolean()
                .withMessage('Please specify whether the business is closed (true or false)'),
            body().custom((value) => {
                if (value.isClosed && value.Working_hours && value.Working_hours.length > 0) {
                    throw new Error('Working hours should not be provided when the business is closed');
                }
                return true;
            })
        ];
    }
}