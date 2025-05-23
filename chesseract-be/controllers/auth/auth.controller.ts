import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../../models/user.model.ts';
import { CustomError } from '../../utils/CustomError.ts';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config/env.ts';
import { SignInRequestBody, SignUpRequestBody, SignUpResponse } from './auth.types.ts';
import { IJwtPayload } from '../../types/IJwtPayload.ts';

export const signUp = async (req: Request<SignUpRequestBody>, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if(existingUser){
            const error = new CustomError('User already exists', 422);
            throw error;
        }

        //hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{
            username,
            email,
            password: hashedPassword,
        }], { session });

        const token = jwt.sign({userId: newUsers[0]._id}, JWT_SECRET as Secret, {expiresIn: "3d"});

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({
            success: true,
            message: "New user created",
            data: {
                token,
                user: {
                    _id: newUsers[0]._id,
                    username: newUsers[0].username,
                    profilePicture: newUsers[0].profilePicture,
                }
            },
        }); 
    }catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

export const signIn = async (req: Request<SignInRequestBody>, res: Response, next: NextFunction) => {
    try{
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if(!existingUser){
            const error = new CustomError('User does not exist', 404);
            throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect){
            const error = new CustomError('Invalid password', 401);
            throw error;
        }

        const token = jwt.sign({userId: existingUser._id}, JWT_SECRET as Secret, {expiresIn: "3d"});

        res.status(200).json({
            success: true,
            message: "User signed in",
            data: {
                token, 
                user:{
                    _id: existingUser._id,
                    username: existingUser.username,
                    profilePicture: existingUser.profilePicture,
                    rating: existingUser.rating,
                }
            },
        });
    }catch(err){
        next(err);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            const error = new CustomError('No token provided', 401);
            throw error;
        }
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET as Secret) as IJwtPayload;
            const user = await User.findById(decoded.userId).select('_id username profilePicture rating');
            
            if (!user) {
                const error = new CustomError('User does not exist', 404);
                throw error;
            }
            
            const expiryTime = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0;
            const shouldRefresh = expiryTime > 0 && expiryTime < 86400;
            
            let refreshedToken = null;
            if (shouldRefresh) {
                refreshedToken = jwt.sign({userId: user._id}, JWT_SECRET as Secret, {expiresIn: "3d"});
            }
            
            res.status(200).json({
                success: true,
                message: "Token is valid",
                data: {
                    user,
                    refreshedToken: refreshedToken
                }
            });
        } catch (err) {
            const error = new CustomError('Session expired. Please log in again.', 401);
            throw error;
        }
    } catch (err) {
        next(err);
    }
}