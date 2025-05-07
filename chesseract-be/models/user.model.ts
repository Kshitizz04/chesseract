import mongoose, { Schema, Document, Types } from "mongoose";

interface stat {
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    highestRating: number;
    lowestRating: number;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    fullname?: string;
    rating: {
        bullet: number;
        blitz: number;
        rapid: number;
    },
    ratingHistory: {
        bullet: [{ date: Date, rating: number }],  //daily rating history
        blitz: [{ date: Date, rating: number }],
        rapid: [{ date: Date, rating: number }],
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
    friends: Types.ObjectId[];
    createdAt: Date;
}

const ratingHistorySchema = new Schema({
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    rating: {
      type: Number,
      required: true,
    },
}, { _id: false });

const userSchema = new Schema<IUser>({
    username:{
        type: String,
        required: [true, "UserName is required"],
        unique: true,
        trim: true,
        maxLength: [50, "UserName should not exceed 50 characters"],
        minLength: [3, "UserName should be at least 3 characters"]
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match : [/\S+@\S+\.\S+/, "Email is not valid"],
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password should be at least 6 characters"],
    },
    fullname:{
        type: String,
        maxLength: [50, "FullName should not exceed 50 characters"],
        minLength: [3, "FullName should be at least 3 characters"],
        trim: true,
    },
    rating:{
        bullet: {type: Number, default: 1200, min: 0},
        blitz: {type: Number, default: 1200, min: 0},
        rapid: {type: Number, default: 1200, min: 0},
    },
    ratingHistory:{
        bullet: { type: [ratingHistorySchema], default: () => [{ date: new Date().setHours(0,0,0,0), rating: 1200 }] },
        blitz: { type: [ratingHistorySchema], default: () => [{ date: new Date().setHours(0,0,0,0), rating: 1200 }] },
        rapid: { type: [ratingHistorySchema], default: () => [{ date: new Date().setHours(0,0,0,0), rating: 1200 }] },
    },
    profilePicture:{type: String},
    bio: {type: String},
    isOnline: {type: Boolean, default: false},
    country: {type: String, default: "Unknown"},
    stats:{
        bullet:{
            wins:{type: Number, default: 0},
            losses:{type: Number, default: 0},
            draws:{type: Number, default: 0},
            gamesPlayed:{type: Number, default: 0},
            highestRating:{type: Number, default: 1200, min: 0},
            lowestRating:{type: Number, default: 1200, min: 0},
        },
        blitz:{
            wins:{type: Number, default: 0},
            losses:{type: Number, default: 0},
            draws:{type: Number, default: 0},
            gamesPlayed:{type: Number, default: 0},
            highestRating:{type: Number, default: 1200,min: 0},
            lowestRating:{type: Number, default: 1200,min: 0},
        },
        rapid:{
            wins:{type: Number, default: 0},
            losses:{type: Number, default: 0},
            draws:{type: Number, default: 0},
            gamesPlayed:{type: Number, default: 0},
            highestRating:{type: Number, default: 1200,min: 0},
            lowestRating:{type: Number, default: 1200,min: 0},
        },
    },
    friends: [{type: Schema.Types.ObjectId, ref: "User"}],
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;