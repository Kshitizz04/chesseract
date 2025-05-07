import { IUser } from "../../models/user.model";
import CommonResponse from "../../utils/CommonResponse";

interface SignUpResponseData {
    user: IUser;
    token: string;
}

export interface SignUpRequestBody {
    username: string;
    email: string;
    password: string
}

export interface SignUpResponse extends CommonResponse<SignUpResponseData> {
    success: boolean;
    message: string;
    data: SignUpResponseData;
}

export interface SignInRequestBody {
    email: string;
    password: string;
}