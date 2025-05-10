import { NextFunction, Request, Response } from 'express';
import User from '../../models/user.model.ts';
import FriendRequest from '../../models/friend-request.model.ts';
import mongoose from 'mongoose';
import { CustomError } from '../../utils/CustomError.ts';
import { AcceptRejectFriendRequestBody, GetAllFriendsResponse, GetAllFriendsResponseData, SendFriendRequestBody } from './friends.types.ts';

// Get all friends of the current user
export const getFriends = async (req: Request, res: Response<GetAllFriendsResponse>, next: NextFunction) => {
    try {
        const currentUserId = req.user?.userId;
        const userId = req.params.userId;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const user = await User.findById(userId)
            .select('friends')
            .populate({
                path: 'friends',
                select:'username fullname country profilePicture rating isOnline _id',
                options: {
                    limit: limit,
                    skip: offset,
                },
            })
            
        if (!user) {
            const error = new CustomError('User not found', 404);
            throw error;
        }

        const friendsData = user.friends as unknown as GetAllFriendsResponseData[];

        // Check if the current user is friends with all users in friendsData and check if current user has requested them
        const updatedFriendsData = await Promise.all(
            friendsData.map(async (friend) => {
            const isFriend = await User.exists({
                _id: currentUserId,
                friends: friend._id,
            });

            const hasRequested = await FriendRequest.exists({
                sender: currentUserId,
                receiver: friend._id,
                status: 'pending',
            });

                return {
                    username: friend.username,
                    profilePicture: friend.profilePicture || "",
                    rating: friend.rating,
                    isOnline: friend.isOnline,
                    _id: friend._id,
                    fullname: friend.fullname || "",
                    country: friend.country || "f",
                    friendStatus: isFriend ? 1 : hasRequested ? 2 : 0, // 0: not friends, 1: friend, 2: requested
                };
            })
        );
        
        res.status(200).json({ success: true, message: "Friends fetched successfully", data: updatedFriendsData});
    } catch (error) {
        next(error);
    }
};

// Get all friend requests (sent and received)
export const getFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 1;
        
        // Get received requests
        const receivedRequests = await FriendRequest.find({ 
            receiver: userId, 
            status: 'pending' 
        })
        .skip(offset)
        .limit(limit)
        .populate('sender', 'username profilePicture rating _id');
        
        // Get sent requests
        const sentRequests = await FriendRequest.find({ 
            sender: userId, 
            status: 'pending' 
        }).populate('receiver', 'username profilePicture rating _id');
        
        res.status(200).json({ 
            success: true, 
            message: "Friend requests fetched successfully",
            data: {
                received: receivedRequests,
                sent: sentRequests
            }
        });
    } catch (error) {
        next(error);
    }
};

// Send a friend request
export const sendFriendRequest = async (req: Request<{}, any, SendFriendRequestBody>, res: Response, next: NextFunction) => {
    try {
        const senderId = req.user?.userId;
        const receiverId = req.body.receiverId;
        
        // Check if users exist
        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);
        
        if (!sender || !receiver) {
            const error = new CustomError('User not found', 404);
            throw error;
        }
        
        // Check if users are already friends
        if (sender.friends.includes(new mongoose.Types.ObjectId(receiverId))) {
            const error = new CustomError('You are already friends with this user', 400);
            throw error;
        }
        
        // Check if there's already a pending request
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ],
            status: 'pending'
        });
        
        if (existingRequest) {
            const error = new CustomError('Friend request already exists', 400);
            throw error;
        }
        
        // Create new friend request
        const friendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId
        });
        
        await friendRequest.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Friend request sent successfully",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Accept a friend request
export const acceptFriendRequest = async (req: Request<{}, any, AcceptRejectFriendRequestBody>, res: Response, next: NextFunction) => {
    try {
        const receiverId = req.user?.userId;
        const senderId = req.body.senderId;
        
        // Find the friend request
        const friendRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });
        
        if (!friendRequest) {
            const error = new CustomError('Friend request not found, it was either removed or cancelled', 404);
            throw error;
        }
        
        // Update the friend request status
        // friendRequest.status = 'accepted';
        // await friendRequest.save();
        
        //for now we are not storing requests to maintain simplicity as we do not need history
        await FriendRequest.findByIdAndDelete(friendRequest._id);
        
        // Add users to each other's friends list
        await Promise.all([
            User.findByIdAndUpdate(
                receiverId, 
                { $addToSet: { friends: senderId } }
            ),
            User.findByIdAndUpdate(
                senderId, 
                { $addToSet: { friends: receiverId } }
            )
        ]);
        
        res.status(200).json({ 
            success: true, 
            message: "Friend request accepted",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Reject a friend request
export const rejectFriendRequest = async (req: Request<{}, any, AcceptRejectFriendRequestBody>, res: Response, next: NextFunction) => {
    
    try {
        const receiverId = req.user?.userId;
        const senderId = req.body.senderId;
        
        // Find and update the friend request
        const friendRequest = await FriendRequest.findOneAndUpdate(
            {
                sender: senderId,
                receiver: receiverId,
                status: 'pending'
            },
            { status: 'rejected' },
            { new: true }
        );
        
        if (!friendRequest) {
            const error = new CustomError('Friend request not found', 404);
            throw error;
        }
        
        //for now we are not storing requests to maintain simplicity as we do not need history
        await FriendRequest.findByIdAndDelete(friendRequest._id);
        
        res.status(200).json({ 
            success: true, 
            message: "Friend request rejected",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Remove a friend
export const removeFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const friendId = req.params.friendId;

        if(!friendId || !userId){
            const error = new CustomError('User not found', 404);
            throw error;
        }
        
        // Remove from both users' friends lists
        await Promise.all([
            User.findByIdAndUpdate(
                userId, 
                { $pull: { friends: friendId } }
            ),
            User.findByIdAndUpdate(
                friendId, 
                { $pull: { friends: userId } }
            )
        ]);
        
        res.status(200).json({ 
            success: true, 
            message: "Friend removed successfully",
            data: null
        });
    } catch (error) {
        next(error);
    }
};