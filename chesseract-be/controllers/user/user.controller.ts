import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../../models/user.model.ts";
import { EditProfileBody, GetUserResponse, GetUsersResponse } from "./user.types.ts";
import { CustomError } from "../../utils/CustomError.ts";

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
        const user = await User.findById(req.params.id).select("-password -stats -friends ratingHistory"); 
        if(!user){
            const error = new CustomError("User not found", 404);
            throw error;
        }
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: user,
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
        ).select('-password');

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