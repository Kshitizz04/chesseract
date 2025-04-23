import { IUser } from "../../models/user.model.ts";
import CommonResponse from "../../utils/CommonResponse.ts";

export interface GetUsersResponse extends CommonResponse<IUser[]> {
    success: boolean;
    message: string;
    data: IUser[];
}

export interface GetUserResponse extends CommonResponse<IUser> {
    success: boolean;
    message: string;
    data: IUser;
}