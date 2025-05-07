import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import { GetUserByIdData } from "./getUserById";

interface EditProfileResponse extends CommonResponse<GetUserByIdData> {}

export interface EditProfileBody {
    fullname?: string;
    profilePicture?: string;
    bio?: string;
    country?: string;
}

const editProfile = async (data: EditProfileBody): Promise<EditProfileResponse> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(`${API_ENDPOINTS.users.editProfile}`, {
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

export default editProfile;