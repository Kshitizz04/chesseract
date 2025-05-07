import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { ResultReason, TimeFormats } from "@/models/GameUtilityTypes";

interface ITimeControl {
    initial: number;     
    increment: number;   
}
  
interface IPlayer {
    _id: string;
    username: string;
    isOnline: boolean;
    fullname?: string;
    profilePicture?: string;
}
  
interface GetGameByIdData {
    _id: string;
    timeControl: ITimeControl;
    whitePlayer: IPlayer;
    blackPlayer: IPlayer;
    whiteRating: number;
    blackRating: number;
    format: TimeFormats;
    moves: string[];
    fen: string;
    status: 'ongoing' | 'finished' | 'abandoned';
    pgn: string;
    resultReason: ResultReason;
    winner: 'white' | 'black' | 'draw';
}

interface GetGameByIdResponse extends CommonResponse<GetGameByIdData> {}

const getGameById = async (gameId: string): Promise<GetGameByIdResponse> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.game.getGameById(gameId), {
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

export default getGameById;
export type { GetGameByIdData };