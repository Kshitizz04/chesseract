import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { TimeFormats } from "@/models/GameUtilityTypes";

interface stat {
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    highestRating: number;
    lowestRating: number;
}

interface GetUserStatsData {
    stats:{
        bullet: stat,
        blitz: stat,
        rapid: stat,
    }
    rating:{
        bullet: number,
        blitz: number,
        rapid: number,
    },
}

interface GetUserStatsResponse extends CommonResponse<GetUserStatsData> {}

const getUserStats = async (userId: string, format: TimeFormats | null): Promise<GetUserStatsResponse> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.analytics.getUserStats(userId, format), {
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

export default getUserStats;
export type { GetUserStatsData };