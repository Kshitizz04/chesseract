import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { GetUserPuzzleScoreData } from "./getPuzzleScore";
import CommonResponse from "@/models/CommonResponse";

interface UpdateUserScoreBody {
    survival?: number;
    threeMinute?: number;
    fiveMinute?: number;
}

const editProfile = async (data: UpdateUserScoreBody): Promise<CommonResponse<GetUserPuzzleScoreData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.puzzles.updateScore}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export default editProfile;