import API_ENDPOINTS from "../../../config/apiConfig";
import { IUser } from "../../models/user";

interface SignInData {
    email: string;
    password: string;
}

interface SignInResponseData {
    token: string;
    user: IUser;
}

interface SignInResponse extends CommonResponse<SignInResponseData> {}

const signIn = async (data: SignInData): Promise<SignInResponse> => {
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
export type{SignInResponse}