import { getLocalStorage } from "@/utils/localstorage";
import CommonResponse from "@/models/CommonResponse";
import API_ENDPOINTS from "../../config/apiConfig";

interface PlayerRatingJumpData {
  _id: string;
  username: string;
  profilePicture?: string;
  country: string;
  ratingJumps: {
    bullet: number;
    blitz: number;
    rapid: number;
    total: number;
  };
}

interface TopFriendsByRatingJumpData {
  topFriends: PlayerRatingJumpData[];
  userRank: number;
  userData: PlayerRatingJumpData;
  totalFriends: number;
}

const getTopFriendsByRatingJump = async (): Promise<CommonResponse<TopFriendsByRatingJumpData>> => {
  try {
    const token = getLocalStorage("token");
    
    const response = await fetch(API_ENDPOINTS.leaderboard.getTopFriendsByRatingJump, {
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

export default getTopFriendsByRatingJump;
export type { TopFriendsByRatingJumpData, PlayerRatingJumpData };