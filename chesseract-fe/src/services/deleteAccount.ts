import { getLocalStorage } from "@/utils/localstorage";
import API_ENDPOINTS from "../../config/apiConfig";
import CommonResponse from "@/models/CommonResponse";

interface deleteAccountBody {
    password: string;
}

const deleteAccount = async (data: deleteAccountBody): Promise<CommonResponse<null>> => {
    try {
        const token = getLocalStorage("token");
        const response = await fetch(API_ENDPOINTS.users.deleteAccount, {
            method: "DELETE",
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

export default deleteAccount;