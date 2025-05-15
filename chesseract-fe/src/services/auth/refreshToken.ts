import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";
import { AuthData } from "@/models/AuthData";

interface RefreshTokenData {
    user: AuthData;
    token: string | null;
}

const refreshToken = async (): Promise<CommonResponse<RefreshTokenData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.auth.refreshToken}`, {
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

export default refreshToken;
export type { RefreshTokenData };