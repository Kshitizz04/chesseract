export interface AuthData {
    _id: string;
    username: string;
    profilePicture: string;
    rating: {
        blitz: number;
        bullet: number;
        rapid: number;
    };
}