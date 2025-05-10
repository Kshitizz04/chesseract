import CommonResponse from "@/models/CommonResponse";
import API_ENDPOINTS from "../../config/apiConfig";

interface Notification {
    _id: string;
    type: 'friend_request' | 'game_challenge';
    sender: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    relatedId: any;
    read: boolean;
    createdAt: string;
}

interface GetNotificationsData {
    notifications: Notification[];
    unreadCount: number;
}

const getNotifications = async (): Promise<CommonResponse<GetNotificationsData>> => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_ENDPOINTS.notifications.getAllNotifications}`, {
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
export default getNotifications;
export type { GetNotificationsData };