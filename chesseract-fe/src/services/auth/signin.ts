import CommonResponse from "@/models/CommonResponse";
import API_ENDPOINTS from "../../../config/apiConfig";
import { AuthData } from "@/models/AuthData";

interface SignInData {
    email: string;
    password: string;
}

interface SignInResponseData {
    token: string;
    user: AuthData;
}

const signIn = async (data: SignInData): Promise<CommonResponse<SignInResponseData>> => {
    try {
        const response = await fetch(API_ENDPOINTS.auth.signIn, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export default signIn;