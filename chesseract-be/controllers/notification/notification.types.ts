export interface MarkAsReadBody {
    notificationIds: string[];
}

export interface HandleFriendReqBody {
    requestId: string;
    action: 'accept' | 'reject';
}

export interface HandleChallengeReqBody {
    challengeId: string;
    action: 'accept' | 'reject';
}