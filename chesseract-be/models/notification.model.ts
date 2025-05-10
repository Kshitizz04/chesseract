import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
    recipient: Types.ObjectId;
    type: 'friend_request' | 'game_challenge';
    relatedId: Types.ObjectId; // ID of the friend request or game challenge
    sender: Types.ObjectId;
    read: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['friend_request', 'game_challenge'],
        required: true
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    read: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;