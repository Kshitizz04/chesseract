import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";
  
interface GetUserPuzzleScoreData {
    survival: number;
    threeMinute: number;
    fiveMinute: number;
}

const getPuzzleScore = async (userId: string): Promise<CommonResponse<GetUserPuzzleScoreData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.puzzles.getScore(userId), {
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

export default getPuzzleScore;
export type { GetUserPuzzleScoreData };