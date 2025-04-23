import { NextFunction, Request, Response } from "express";
import User from "../../models/user.model.ts";
import { GetUserResponse, GetUsersResponse } from "./user.types.ts";
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
        const user = await User.findById(req.params.id).select("-password"); 
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