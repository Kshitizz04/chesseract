import { NextFunction, Request, Response } from 'express';
import User from '../../models/user.model.ts';
import FriendRequest from '../../models/friend-request.model.ts';
import mongoose, { Types } from 'mongoose';
import { CustomError } from '../../utils/CustomError.ts';
import { AcceptRejectFriendRequestBody, GetAllFriendsResponse, GetAllFriendsResponseData, SendFriendRequestBody } from './friends.types.ts';
import Notification from '../../models/notification.model.ts';
import Game from '../../models/game.model.ts';

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

        await Notification.create({
            recipient: receiverId,
            type: 'friend_request',
            relatedId: friendRequest._id,
            sender: senderId,
            read: false,
        })
        
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

export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = req.user?.userId; 
        
        if (!currentUserId) {
            const error = new CustomError('Unauthorized', 401);
            throw error;
        }
        
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            const error = new CustomError('User not found', 404);
            throw error;
        }
        
        // 1. Users with most games played (who aren't friends)
        const mostActiveUsers = await Game.aggregate([
            {
                $match: {
                $or: [
                    { whitePlayer: { $ne: new mongoose.Types.ObjectId(currentUserId) } },
                    { blackPlayer: { $ne: new mongoose.Types.ObjectId(currentUserId) } }
                ],
                status: "finished"
                }
            },
            {
                $group: {
                _id: {
                    $cond: [
                    { $eq: ["$whitePlayer", new mongoose.Types.ObjectId(currentUserId)] },
                    "$blackPlayer",
                    "$whitePlayer"
                    ]
                },
                gamesCount: { $sum: 1 }
                }
            },
            { $match: { _id: { $nin: currentUser.friends } } }, // Exclude friends
            { $sort: { gamesCount: -1 } },
            { $limit: 20 } // Get top 20 to randomly select from
        ]);
        
        // 2. Recent opponents (who aren't friends)
        const recentOpponents = await Game.aggregate([
            {
                $match: {
                $or: [
                    { whitePlayer: new mongoose.Types.ObjectId(currentUserId) },
                    { blackPlayer: new mongoose.Types.ObjectId(currentUserId) }
                ],
                status: "finished"
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                _id: {
                    $cond: [
                    { $eq: ["$whitePlayer", new mongoose.Types.ObjectId(currentUserId)] },
                    "$blackPlayer",
                    "$whitePlayer"
                    ]
                },
                lastPlayedDate: { $first: "$createdAt" }
                }
            },
            { $match: { _id: { $nin: currentUser.friends } } }, // Exclude friends
            { $sort: { lastPlayedDate: -1 } },
            { $limit: 20 } // Get 20 most recent to randomly select from
        ]);
        
        // 3. Users with mutual friends
        // First, get all friends of current user's friends 
        const friendsOfFriends = await User.aggregate([
            { $match: { _id: { $in: currentUser.friends } } },
            { $unwind: "$friends" },
            { $group: { _id: "$friends", mutualFriendCount: { $sum: 1 } } },
            { $match: {
                $and: [
                    { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } }, // Exclude current user
                    { _id: { $nin: currentUser.friends } } // Exclude direct friends
                ]}
            },
            { $sort: { mutualFriendCount: -1 } },
            { $limit: 20 } // Get top 20 to randomly select from
        ]);

        // Get detailed user information for all candidates
        const mostActiveUserIds = mostActiveUsers.map(u => u._id);
        const recentOpponentIds = recentOpponents.map(u => u._id);
        const mutualFriendUserIds = friendsOfFriends.map(u => u._id);
        
        // Combine all IDs for a single query
        const allCandidateIds = [
        ...new Set([...mostActiveUserIds, ...recentOpponentIds, ...mutualFriendUserIds])
        ];
        
        const userDetails = await User.find(
        { _id: { $in: allCandidateIds } }
        ).select('username profilePicture rating isOnline country _id fullname');
        
        // Create a map for quick lookup
        const userDetailsMap = new Map(
            userDetails.map(user => [(user._id as Types.ObjectId).toString(), user])
        );
        
        // Randomly select 5 users from each category
        function getRandomSubset(array: any[], count: number) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
        }
        
        const randomMostActive = getRandomSubset(mostActiveUsers, 5).map(u => ({
            ...userDetailsMap.get(u._id.toString())?.toObject(),
            gamesCount: u.gamesCount
        }));
        
        const randomRecentOpponents = getRandomSubset(recentOpponents, 5).map(u => ({
            ...userDetailsMap.get(u._id.toString())?.toObject(),
            lastPlayed: u.lastPlayedDate
        }));
        
        const randomMutualFriends = await Promise.all (
            getRandomSubset(friendsOfFriends, 5).map(async (u) => {
                // Find up to 2 mutual friends between currentUser and this user
                const mutuals = await User.aggregate([
                    { $match: { 
                        _id: { $in: currentUser.friends },
                        friends: new mongoose.Types.ObjectId(u._id)
                    }},
                    { $project: { _id: 1, username: 1, profilePicture: 1 }},
                    { $limit: 2 }
                ]);
                
                return {
                    ...userDetailsMap.get(u._id.toString())?.toObject(),
                    mutualFriendCount: u.mutualFriendCount,
                    mutualFriends: mutuals // Up to 2 mutual friends
                };
            })
        );
        
        res.status(200).json({
            success: true,
            message: "Suggestions fetched successfully",
            data: {
                mostActive: randomMostActive.filter(Boolean),
                recentOpponents: randomRecentOpponents.filter(Boolean),
                mutualFriends: randomMutualFriends.filter(Boolean),
            }
        });
    } catch (error) {
        next(error);
    }
};