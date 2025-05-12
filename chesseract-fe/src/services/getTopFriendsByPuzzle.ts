import { getLocalStorage } from "@/utils/localstorage";
import CommonResponse from "@/models/CommonResponse";
import { PuzzleFormats } from "@/models/GameUtilityTypes";
import API_ENDPOINTS from "../../config/apiConfig";
import { PlayerPuzzleData } from "./getTopPlayersByPuzzle";

interface TopFriendsByPuzzleData {
  topFriends: PlayerPuzzleData[];
  userRank: number;
  userData: PlayerPuzzleData;
  totalFriends: number;
}

const getTopFriendsByPuzzleScore = async (format: PuzzleFormats, country: string | null): Promise<CommonResponse<TopFriendsByPuzzleData>> => {
  try {
    const token = getLocalStorage("token");
      
    const response = await fetch(API_ENDPOINTS.leaderboard.getTopFriendsByPuzzleScore(format, country), {
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
};

export default getTopFriendsByPuzzleScore;
export type { TopFriendsByPuzzleData };