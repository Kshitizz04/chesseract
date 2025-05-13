import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface MostGamesAgainst {
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
    gamesCount: number;
}

interface Mutuals {
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
    mutualFriendCount: number;
    mutualFriends: Array<{
        _id: string;
        username: string;
        profilePicture: string;
    }>;
}

interface RecentOpponents {
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
    lastPlayed: string;
}



interface GetSuggestionsData {
    mostActive: MostGamesAgainst[];
    recentOpponents: RecentOpponents[];
    mutualFriends: Mutuals[];
}

const getUserBySearch = async (): Promise<CommonResponse<GetSuggestionsData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.friends.getSuggestions, {
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
export type { GetSuggestionsData };