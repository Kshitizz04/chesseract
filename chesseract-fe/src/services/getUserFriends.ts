import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface GetUserFriendsData {
    username: string;
    profilePicture: string;
    rating: {
        bullet: number;
        blitz: number;
        rapid: number;
    };
    isOnline: boolean;
    _id: string;
    country: string;
    fullname: string;
    friendStatus: number; // 0: not friends, 1: friend, 2: requested
}

const getUserFriends = async (userId: string, limit: number | null, offset:number | null): Promise<CommonResponse<GetUserFriendsData[]>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.friends.getAllFriends(userId, limit, offset), {
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

export default getUserFriends;
export type { GetUserFriendsData };