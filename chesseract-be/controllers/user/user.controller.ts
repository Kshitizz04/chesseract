import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../../models/user.model.ts";
import { EditProfileBody, GetUserResponse, GetUsersResponse } from "./user.types.ts";
import { CustomError } from "../../utils/CustomError.ts";
import FriendRequest from "../../models/friend-request.model.ts";
import { Types } from "mongoose";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user?.userId;
        
        if (!query || typeof query !== 'string') {
            const error = new CustomError("Search query is required", 400);
            throw error;
        }
        
        // Get current user to access friends list
        const currentUser = await User.findById(currentUserId);
        
        if (!currentUser) {
            const error = new CustomError("User not found", 404);
            throw error;
        }
        
        // Create regex for case-insensitive search
        const searchRegex = new RegExp(query, 'i');
        
        // Find users matching the search query
        const users = await User.find({
            $or: [
                { username: { $regex: searchRegex } },
                { fullname: { $regex: searchRegex } }
            ],
            _id: { $ne: currentUserId } // Exclude current user
        }).select('username profilePicture rating isOnline country _id fullname');
        
        // Separate users into friends and non-friends
        const friends = users.filter(user => 
            currentUser.friends.includes(user._id as Types.ObjectId)
        );
        
        const nonFriends = users.filter(user => 
            !currentUser.friends.includes(user._id as Types.ObjectId)
        );
        
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                friends: friends,
                nonFriends: nonFriends,
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req: Request, res: Response<GetUserResponse>, next: NextFunction) => {
    try{
        const currentUserId = req.user?.userId;
        const userId = req.params.id;
        
        const user = await User.findById(userId).select("-password -stats -friends -ratingHistory"); 
        if(!user){
            const error = new CustomError("User not found", 404);
            throw error;
        }

        // Check if the user is friend of current user
        let friendStatus = 0;
        const isFriend = await User.exists({
            _id: currentUserId,
            friends: userId,
        });
        const hasRequested = await FriendRequest.exists({
            sender: currentUserId,
            receiver: userId,
            status: 'pending',
        });

        friendStatus =  isFriend ? 1 : hasRequested ? 2 : 0, // 0: not friends, 1: friend, 2: requested

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                username: user.username,
                email: user.email,
                fullname: user.fullname || "",
                rating : user.rating,
                profilePicture: user.profilePicture || "",
                bio: user.bio || "",
                isOnline: user.isOnline,
                country: user.country || "",
                createdAt: user.createdAt.toString(),
                friendStatus: friendStatus,
            },
        });
    }catch(err){
        next(err);
    }
}

export const editProfile = async (req: Request<{}, any, EditProfileBody>, res: Response, next: NextFunction) => {
    try{
        const userId = req.user?.userId;
        if(!userId){
            const error = new CustomError("User not found", 404);
            throw error;
        }

        const { fullname, bio, profilePicture, country } = req.body;
        console.log(req.body);

        const updateFields: Partial<IUser> = {};

        if (fullname !== undefined) updateFields.fullname = fullname;
        if (bio !== undefined) updateFields.bio = bio;
        if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;
        if (country !== undefined) updateFields.country = country;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password -stats -friends -ratingHistory');

        if(!updatedUser) {
            const error = new CustomError("User not found", 404);
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    }catch(err){
        next(err);
    }
}