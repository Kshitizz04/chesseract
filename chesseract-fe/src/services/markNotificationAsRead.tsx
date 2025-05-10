import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface MarkAsReadBody {
    notificationIds: string[];
}

interface MarkAsReadData {
    unreadCount: number;
}

const markNotificationAsRead = async (data: MarkAsReadBody): Promise<CommonResponse<MarkAsReadData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.notifications.markAsRead}`, {
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

export default markNotificationAsRead;
export type { MarkAsReadData };