import CommonResponse from "@/models/CommonResponse";
import API_ENDPOINTS from "../../../config/apiConfig";
import { IUser } from "../../models/user";
import { AuthData } from "@/models/AuthData";

interface SignUpData {
    username: string;
    email: string;
    password: string;
}

interface SignUpResponseData {
    token: string;
    user: AuthData;
}

const signUp = async (data: SignUpData): Promise<CommonResponse<SignUpResponseData>> => {
    try {
        const response = await fetch(API_ENDPOINTS.auth.signUp, {
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

export default signUp;