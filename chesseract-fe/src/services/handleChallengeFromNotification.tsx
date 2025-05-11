import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";
import { TimeFormats } from "@/models/GameUtilityTypes";

interface HandleChallengeReqBody {
    challengeId: string;
    action: 'accept' | 'reject';
}
interface GameChallenge {
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

interface HandleChallengeFromNotificationData {
    gameChallenge: GameChallenge;
    unreadCount: number;
}

const handleChallengeFromNotification = async (data: HandleChallengeReqBody): Promise<CommonResponse<HandleChallengeFromNotificationData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.notifications.handleGameChallenge}`, {
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

export default handleChallengeFromNotification;
export type { HandleChallengeFromNotificationData, GameChallenge };