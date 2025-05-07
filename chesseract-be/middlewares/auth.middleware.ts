import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../config/env.ts";
import jwt, { Secret } from 'jsonwebtoken';
import User, { IUser } from "../models/user.model.ts";
import { IJwtPayload } from "../types/IJwtPayload.ts";
import { Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

const authorize = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let token = req.headers.authorization?.split(" ")[1];
        if(!token){
            res.status(401).json({
                success: false,
                message: "Please sign in to access this resource",
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;

        const user = await User.findById(decoded.userId);
        if(!user){
            res.status(401).json({ 
                success: false,
                message: "You are not authorized to access this resource",
            });
            return;
        }

        req.user={userId: (user._id as Types.ObjectId).toString()};
        next();
    }catch(err){
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: err,
        });
    }

}

export default authorize;