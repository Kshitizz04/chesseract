import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";

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
    createdAt: Date;
}

interface GetUserByIdResponse extends CommonResponse<GetUserByIdData> {}

const getUserById = async (id: string): Promise<GetUserByIdResponse> => {
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