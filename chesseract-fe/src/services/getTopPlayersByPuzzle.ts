import { getLocalStorage } from "@/utils/localstorage";
import CommonResponse from "@/models/CommonResponse";
import { PuzzleFormats } from "@/models/GameUtilityTypes";
import API_ENDPOINTS from "../../config/apiConfig";

interface PlayerPuzzleData {
  _id: string;
  username: string;
  profilePicture?: string;
  country: string;
  puzzleScores: {
    survival?: number;
    threeMinute?: number;
    fiveMinute?: number;
  };
}

interface TopPlayersByPuzzleData {
  topPlayers: PlayerPuzzleData[];
  userRank: number | null;
  userData: PlayerPuzzleData | null;
}

const getTopPlayersByPuzzleScore = async (format: PuzzleFormats, country: string | null): Promise<CommonResponse<TopPlayersByPuzzleData>> => {
  try {
    const token = getLocalStorage("token");
    const response = await fetch(API_ENDPOINTS.leaderboard.getTopPlayersByPuzzleScore(format, country), {
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

export default getTopPlayersByPuzzleScore;
export type { TopPlayersByPuzzleData, PlayerPuzzleData };