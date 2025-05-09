import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface Puzzle {
    _id: string;
    PuzzleId: string;
    FEN: string;
    Moves: string;
    Rating: number;
    Themes: string;
    OpeningTags: string;
}

interface GetPuzzlesData {
    puzzles: Puzzle[];
    endRating: number;
}

const getPuzzlesInitial = async (startRating: number | null, endRating: number | null, batchSize: number | null): Promise<CommonResponse<GetPuzzlesData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.puzzles.getInitialBatch(startRating, endRating, batchSize), {
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

export default getPuzzlesInitial;
export type { GetPuzzlesData };