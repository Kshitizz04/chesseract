import { getLocalStorage } from "@/utils/localstorage";
import CommonResponse from "@/models/CommonResponse";
import API_ENDPOINTS from "../../config/apiConfig";

interface PlayerGamesPlayedData {
  _id: string;
  username: string;
  profilePicture?: string;
  country: string;
  totalGamesPlayed: number;
  gamesByFormat: {
    bullet: number;
    blitz: number;
    rapid: number;
  };
}

interface TopPlayersByGamesPlayedData {
  topPlayers: PlayerGamesPlayedData[];
}

const getTopPlayersByGamesPlayed = async (country: string | null): Promise<CommonResponse<TopPlayersByGamesPlayedData>> => {
  try {
    const token = getLocalStorage("token");
      
    const response = await fetch(API_ENDPOINTS.leaderboard.getTopPlayersByGamesPlayed(country), {
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

export default getTopPlayersByGamesPlayed;
export type { TopPlayersByGamesPlayedData, PlayerGamesPlayedData };