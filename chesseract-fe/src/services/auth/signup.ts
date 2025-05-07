import API_ENDPOINTS from "../../../config/apiConfig";
import { IUser } from "../../models/user";

interface SignUpData {
    username: string;
    email: string;
    password: string;
}

interface SignUpResponseData {
    token: string;
    user: IUser;
}

interface SignUpResponse extends CommonResponse<SignUpResponseData> {}

const signUp = async (data: SignUpData): Promise<SignUpResponse> => {
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
export type{SignUpResponse}