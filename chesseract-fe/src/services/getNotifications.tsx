import CommonResponse from "@/models/CommonResponse";
import API_ENDPOINTS from "../../config/apiConfig";
import { TimeFormats } from "@/models/GameUtilityTypes";

interface Request {
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    _id: string;
}

interface Challenge{
    _id: string;
    challenger: string;
    recipient: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    format: TimeFormats;
    timeControl: {
        initial: number; 
        increment: number; 
    };
    color: 'random' | 'white' | 'black';
    expiresAt: Date;
}

interface Notification {
    _id: string;
    type: 'friend_request' | 'game_challenge';
    sender: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    relatedId: Request | Challenge;
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
export type { GetNotificationsData, Notification };