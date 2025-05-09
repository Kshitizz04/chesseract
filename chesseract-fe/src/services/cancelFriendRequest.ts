import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

const cancelFriendRequest = async (friendId: string): Promise<CommonResponse<null>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.friends.cancelRequest(friendId), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export default cancelFriendRequest;