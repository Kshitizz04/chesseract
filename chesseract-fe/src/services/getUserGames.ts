import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { TimeFormats } from "@/models/GameUtilityTypes";

export interface Game {
    _id: string;
    whitePlayer: {
        _id: string;
        username: string;
        isOnline: boolean;
        fullname?: string;
        profilePicture?: string;
    };
    blackPlayer: {
        _id: string;
        username: string;
        isOnline: boolean;
        fullname?: string;
        profilePicture?: string;
    };
    format: TimeFormats;
    moves: string[];
    createdAt: string;
    winner: 'white' | 'black' | 'draw';
}

interface GetGameHistoryData {
    games: Game[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface GetGameHistoryResponse extends CommonResponse<GetGameHistoryData> {}

const getUserGames = async (userId: string, format: TimeFormats | null, limit: number | null, page:number | null): Promise<GetGameHistoryResponse> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.game.getUserGames(userId, format, limit, page), {
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

export default getUserGames;
export type { GetGameHistoryData };