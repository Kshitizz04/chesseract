import { TimeFrame } from "@/models/GameUtilityTypes";
import { GetUserRatingHistoryData } from "@/services/getUserRatingHistory";

const fillMissingDates = (ratingData: {date: string, rating: number}[], startDate: Date, endDate: Date) => {
    if (!ratingData || ratingData.length === 0) return [];

    const formatDateToStr = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const allDates: string[] = [];
    const currentDate = new Date(startDate) < new Date(ratingData[0].date) ? new Date(ratingData[0].date) : new Date(startDate);
    const lastDate = new Date(endDate);
    
    currentDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= lastDate) {
        allDates.push(formatDateToStr(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Initialize with the first rating or a default
    let currentRating = ratingData.length > 0 ? ratingData[0].rating : 1200;
    let dataIndex = 0;
    
    return allDates.map(dateStr => {
        // Check if we have a rating for this date
        if (dataIndex < ratingData.length && ratingData[dataIndex].date === dateStr) {
            currentRating = ratingData[dataIndex].rating;
            dataIndex++;
        }
        
        // Return the date with the current rating
        return {
            date: dateStr,
            rating: currentRating
        };
    });
};


export const fillMissingHistory = (
    ratingHistory: GetUserRatingHistoryData | null, 
    startDate: Date, 
    endDate: Date
): GetUserRatingHistoryData => {
    if (!ratingHistory) {
        return { bullet: [], blitz: [], rapid: [] };
    }
    
    return {
        bullet: fillMissingDates(ratingHistory.bullet, startDate, endDate),
        blitz: fillMissingDates(ratingHistory.blitz, startDate, endDate),
        rapid: fillMissingDates(ratingHistory.rapid, startDate, endDate)
    };
};

export default fillMissingHistory;

export const getStartDate = (timeframe: TimeFrame) => {
    const now = new Date();
    let startDate = new Date();

    switch(timeframe) {
        case '1w': // 1 week
            startDate.setDate(now.getDate() - 7);
            break;
        case '1m': // 1 month
            startDate.setMonth(now.getMonth() - 1);
            break;
        case '3m': // 3 months
            startDate.setMonth(now.getMonth() - 3);
            break;
        case '6m': // 6 months
            startDate.setMonth(now.getMonth() - 6);
            break;
        case '1y': // 1 year
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate = now;
    }
    return startDate;
}