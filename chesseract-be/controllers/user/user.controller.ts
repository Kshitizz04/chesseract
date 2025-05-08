import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../../models/user.model.ts";
import { EditProfileBody, GetUserResponse, GetUsersResponse } from "./user.types.ts";
import { CustomError } from "../../utils/CustomError.ts";
import FriendRequest from "../../models/friend-request.model.ts";

export const getUsers = async (req: Request, res: Response<GetUsersResponse>, next: NextFunction) => {
    try{
        const users = await User.find().select("-password"); 
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    }catch(err){
        next(err);
    }
}

export const getUser = async (req: Request, res: Response<GetUserResponse>, next: NextFunction) => {
    try{
        const currentUserId = req.user?.userId;
        const user = await User.findById(req.params.id).select("-password -stats -friends -ratingHistory"); 
        if(!user){
            const error = new CustomError("User not found", 404);
            throw error;
        }

        // Check if the user is friend of current user
        let friendStatus = 0;
        const isFriend = user.friends.some((friendId) => friendId.toString() === currentUserId);

        const hasRequested = await FriendRequest.findOne({
            $or: [
                { sender: currentUserId, receiver: req.params.id },
            ],
            status: "pending",
        });

        if(!isFriend){
            if(hasRequested){
                friendStatus = 2;
            }
            else{
                friendStatus = 0;
            }
        }else{
            friendStatus = 1;
        }

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