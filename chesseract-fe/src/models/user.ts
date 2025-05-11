interface stat {
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    highestRating: number;
    lowestRating: number;
}

export interface IUser {
    username: string;
    email: string;
    password: string;
    fullname?: string;
    rating: {
        bullet: number;
        blitz: number;
        rapid: number;
    },
    profilePicture?: string;
    bio?: string;
    isOnline: boolean;
    country: string;
    stats: {
        bullet: stat,
        blitz: stat,
        rapid: stat,
    },
    createdAt: Date;
    _id: number;
}