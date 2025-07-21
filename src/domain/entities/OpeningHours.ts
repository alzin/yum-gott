export interface OpeningHoursPeriod {
    startTime: string;
    endTime: string;
}

export interface OpeningHours {
    id?: string;
    restaurantOwnerId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    Working_hours: OpeningHoursPeriod[];
    isClosed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}