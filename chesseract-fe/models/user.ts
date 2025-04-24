export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    fullname?: string;
    rating: number;
    games: [];
    createdAt: Date;
}