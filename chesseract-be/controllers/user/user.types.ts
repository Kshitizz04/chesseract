import { IUser } from "../../models/user.model.ts";
import CommonResponse from "../../utils/CommonResponse.ts";

export interface GetUsersResponse extends CommonResponse<IUser[]> {
    success: boolean;
    message: string;
    data: IUser[];
}

export interface GetUserResponse  {
    success: boolean;
    message: string;
    data: {
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
        isOnline: {
            isOnline: boolean;
            showOnlineStatus: boolean;
        };
        country: string;
        createdAt: string;
        friendStatus: number; // 0: not friends, 1: friends, 2: requested
    };
}

export interface EditProfileBody {
    fullname?: string;
    profilePicture?: string;
    bio?: string;
    country?: string;
}

export interface updateOnlineVisibilityBody {
    showOnlineStatus: boolean;
}

export interface deleteAccountBody {
    password: string;
}