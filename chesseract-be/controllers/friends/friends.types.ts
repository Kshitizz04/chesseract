import CommonResponse from "../../utils/CommonResponse.ts";

export interface GetAllFriendsResponseData {
    username: string;
    profilePicture: string;
    rating: number;
    isOnline: boolean;
    _id: string;
    friendStatus: number; // 0: not friends, 1: friend, 2: requested
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




