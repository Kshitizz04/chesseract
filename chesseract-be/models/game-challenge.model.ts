import mongoose, { Schema, Document, Types } from "mongoose";
import { TimeFormat } from "../types/TimeFormat";

export interface IGameChallenge extends Document {
    challenger: Types.ObjectId;
    recipient: Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    format: TimeFormat;
    timeControl: {
        initial: number; 
        increment: number; 
    };
    color: 'random' | 'white' | 'black';
    expiresAt: Date;
}

const gameChallengeSchema = new Schema<IGameChallenge>({
    challenger: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    },
    format: {
        type: String,
        enum: ['blitz', 'rapid', 'bullet'],
        required: true
    },
    timeControl: {
        initial: { type: Number, required: true },
        increment: { type: Number, required: true },
    },
    color: {
        type: String,
        enum: ['random', 'white', 'black'],
        default: 'random'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes by default
    }
}, {timestamps: true});

const GameChallenge = mongoose.model("GameChallenge", gameChallengeSchema);

export default GameChallenge;