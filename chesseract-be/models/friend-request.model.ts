import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFriendRequest extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>({
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    receiver: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    }
}, {timestamps: true});

// Create a compound index to ensure uniqueness
//friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;