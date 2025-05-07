import { NextFunction, Request, Response } from "express";
import aj from "../config/arcjet.ts";

const arcjetMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const decision = await aj.protect(req, {requested: 1});

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                res.status(429).json({
                    success: false,
                    message: "Rate limit exceeded. Please try again later.",
                });
                return;
            }
            if(decision.reason.isBot()){
                res.status(403).json({
                    success: false,
                    message: "Access denied. Bots detected.",
                });
                return;
            }
            res.status(403).json({
                success: false,
                message: "Access denied.",
            });
            return;
        }
        next();
    }catch(error){
        console.error("Error in arcjetMiddleware:", error);
        next(error);
    }
}

export default arcjetMiddleware;