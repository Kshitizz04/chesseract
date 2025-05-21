import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface UpdateOnlineVisibilityBody {
    showOnlineStatus: boolean;
}

const updateOnlineVisibility = async (data: UpdateOnlineVisibilityBody): Promise<CommonResponse<null>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.users.updateOnlineVisibility}`, {
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

export default updateOnlineVisibility;