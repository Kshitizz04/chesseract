import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";
import { GetPuzzlesData } from "./getInitialPuzzles";

const getPuzzlesNext = async (currentEndRating: number | null, batchSize: number | null): Promise<CommonResponse<GetPuzzlesData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.puzzles.getNextBatch(currentEndRating, batchSize), {
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

export default getPuzzlesNext;