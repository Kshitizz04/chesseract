import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    fullname?: string;
    rating: number;
    games: Types.ObjectId[];
    createdAt: Date;
}

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
        type: Number,
        default: 1200,
        min: [0, "Rating should be at least 0"],
        max: [3200, "Rating should not exceed 3000"],
    },
    games: [{
        type: Schema.Types.ObjectId,
        ref: "Game",
    }],
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;