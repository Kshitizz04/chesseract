import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

export interface HandleFriendReqBody {
    requestId: string;
    action: 'accept' | 'reject';
}

interface HandleRequestFromNotificationData {
    unreadCount: number;
}

const handleRequestFromNotification = async (data: HandleFriendReqBody): Promise<CommonResponse<HandleRequestFromNotificationData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.notifications.handleFriendRequest}`, {
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

export default handleRequestFromNotification;
export type { HandleRequestFromNotificationData };