import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../../models/user.model.ts';
import { CustomError } from '../../utils/CustomError.ts';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config/env.ts';
import { SignInRequestBody, SignUpRequestBody, SignUpResponse } from './auth.types.ts';

export const signUp = async (req: Request<SignUpRequestBody>, res: Response<SignUpResponse>, next: NextFunction) => {
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

        console.log(JWT_EXPIRES_IN, JWT_SECRET);
        const token = jwt.sign({userId: newUsers[0]._id}, JWT_SECRET as Secret, {expiresIn: "3d"});

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({
            success: true,
            message: "New user created",
            data: {token, user:newUsers[0]},
        }); 
    }catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

export const signIn = async (req: Request<SignInRequestBody>, res: Response<SignUpResponse>, next: NextFunction) => {
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
            data: {token, user:existingUser},
        });
    }catch(err){
        next(err);
    }
}

export const signOut = async (req: Request, res: Response, next: NextFunction) => {

}