import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface User {
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
}

interface GetUsersBySearchData {
    friends: User[];
    nonFriends: User[];
}

const getUserBySearch = async (query: string): Promise<CommonResponse<GetUsersBySearchData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.users.getAll(query), {
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

export default getUserBySearch;
export type { GetUsersBySearchData };