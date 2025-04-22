import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../Types';

const errorMiddleware = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    try{
        let error = {...err};
        error.message = err.message;
        console.error(err);

        // Mongoose bad ObjectId error
        if(err.name === "CastError"){
            const message = "Resource not found";
            error = new Error(message);
            error.statusCode = 404;
        }

        // Mongoose duplicate key error
        if(err.statusCode === 11000){
            const message = "Duplicate field value entered";
            error = new Error(message);
            error.statusCode = 400;
        }

        // Mongoose validation error
        // if(err.name === "ValidationError"){
        //     const message = Object.values(err.errors).map(val => val.message);
        //     error = new Error(message.join(", "));
        //     error.statusCode = 400;
        // }

        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Server Error",
        });
    }catch{
        next(err);
    }
}

export default errorMiddleware;