import CommonResponse from "../../utils/CommonResponse.ts";

export interface GetAllFriendsResponseData {
    username: string;
    profilePicture: string;
    rating: number;
    isOnline: boolean;
    _id: string;
}

export interface GetAllFriendsResponse extends CommonResponse<GetAllFriendsResponseData[]> {
    success: boolean;
    message: string;
    data: GetAllFriendsResponseData[];
}

export interface SendFriendRequestBody {
    receiverId: string;
}

export interface AcceptRejectFriendRequestBody {
    senderId: string;
}




