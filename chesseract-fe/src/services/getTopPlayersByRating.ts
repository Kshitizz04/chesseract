import { getLocalStorage } from "@/utils/localstorage";
import CommonResponse from "@/models/CommonResponse";
import { TimeFormats } from "@/models/GameUtilityTypes";
import API_ENDPOINTS from "../../config/apiConfig";

interface PlayerRatingData {
  _id: string;
  username: string;
  profilePicture?: string;
  country: string;
  rating: {
    bullet?: number;
    blitz?: number;
    rapid?: number;
  };
  stats?: {
    bullet: {
      wins?: number;
      losses?: number;
      draws?: number;
      gamesPlayed?: number;
      highestRating?: number;
      lowestRating?: number;
    },
    blitz: {
      wins?: number;
      losses?: number;
      draws?: number;
      gamesPlayed?: number;
      highestRating?: number;
      lowestRating?: number;
    },
    rapid: {
      wins?: number;
      losses?: number;
      draws?: number;
      gamesPlayed?: number;
      highestRating?: number;
      lowestRating?: number;
    },
  };
}

interface TopPlayersByRatingData {
  topPlayers: PlayerRatingData[];
  userRank: number | null;
  userData: PlayerRatingData;
}

const getTopPlayersByRating = async (format: TimeFormats, country: string | null): Promise<CommonResponse<TopPlayersByRatingData>> => {
  try {
    const token = getLocalStorage("token");
    const response = await fetch(API_ENDPOINTS.leaderboard.getTopPlayersByRating(format, country), {
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

export default getTopPlayersByRating;
export type { TopPlayersByRatingData, PlayerRatingData };