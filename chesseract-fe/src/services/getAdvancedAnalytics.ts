import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { TimeFormats, ResultReason } from "@/models/GameUtilityTypes";
import CommonResponse from "@/models/CommonResponse";

type reason = {
    [reason in ResultReason]: number;
}

interface GetAdvancedAnalyticsData {
    colorPerformance:{
        asWhite:{
            wins: number;
            losses: number;
            draws: number;
            total: number;
        },
        asBlack:{
            wins: number;
            losses: number;
            draws: number;
            total: number;
        }
    },
    resultReasons: reason[],
    averageGameLength: number,
    totalGames: number,
}

const getAdvancedAnalytics = async (userId: string, format: TimeFormats | null): Promise<CommonResponse<GetAdvancedAnalyticsData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.analytics.getAdvancedAnalytics(userId, format), {
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

export default getAdvancedAnalytics;
export type { GetAdvancedAnalyticsData };