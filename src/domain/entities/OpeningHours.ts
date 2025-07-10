export interface OpeningHours{
    id?:string;
    restaurantOwnerId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime?:string;
    endTime?:string;
    isClosed?:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}