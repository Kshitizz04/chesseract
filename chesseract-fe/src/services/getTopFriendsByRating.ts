import { getLocalStorage } from "@/utils/localstorage";
import CommonResponse from "@/models/CommonResponse";
import { TimeFormats } from "@/models/GameUtilityTypes";
import { PlayerRatingData } from "./getTopPlayersByRating";
import API_ENDPOINTS from "../../config/apiConfig";

interface TopFriendsByRatingData {
  topFriends: PlayerRatingData[];
  userRank: number;
  userData: PlayerRatingData;
  totalFriends: number;
}

const getTopFriendsByRating = async (format: TimeFormats, country: string|null): Promise<CommonResponse<TopFriendsByRatingData>> => {
  try {
    const token = getLocalStorage("token");
      
    const response = await fetch(API_ENDPOINTS.leaderboard.getTopFriendsByRating(format, country), {
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

export default getTopFriendsByRating;
export type { TopFriendsByRatingData };