import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface GetUserByIdData {
    username: string;
    email: string;
    fullname?: string;
    rating: {
        bullet: number;
        blitz: number;
        rapid: number;
    },
    profilePicture?: string;
    bio?: string;
    isOnline: boolean;
    country: string;
    createdAt: string;
}

const getUserById = async (id: string): Promise<CommonResponse<GetUserByIdData>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.users.getById(id), {
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

export default getUserById;
export type { GetUserByIdData };