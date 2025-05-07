import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { TimeFormats, TimeFrame } from "@/models/GameUtilityTypes";

interface ratingEntry {
    date: string;
    rating: number;
}

interface GetUserRatingHistoryData {
    bullet: ratingEntry[];
    blitz: ratingEntry[];
    rapid: ratingEntry[];
}

interface GetUserRatingHistoryResponse extends CommonResponse<GetUserRatingHistoryData> {}

const getUserRatingHistory = async (userId: string, format: TimeFormats | null, timeframe: TimeFrame | null): Promise<GetUserRatingHistoryResponse> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.analytics.getUserRatingHistory(userId, format, timeframe), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export default getUserRatingHistory;
export type { GetUserRatingHistoryData };