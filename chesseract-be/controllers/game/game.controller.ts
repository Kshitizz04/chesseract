import { NextFunction, Request, Response } from "express";
import Game from "../../models/game.model.ts";
import { CustomError } from "../../utils/CustomError.ts";

export const getUserGames = async (req: Request, res: Response, next: NextFunction)=>{
    try{

        const userId = req.params.userId;
        const {format, limit = 20, page = 1} = req.query;
        const skip = (Number(page) - 1) * Number(limit);
    
        let query:any = {
            $or: [
                { whitePlayer: userId },
                { blackPlayer: userId }
            ],
            status: 'finished'
        }
    
        if(format && ['bullet', 'blitz', 'rapid'].includes(format as string)){
            query['format'] = format; 
        }

        const games = await Game.find(query)
            .select('whitePlayer blackPlayer moves createdAt winner format')
            .limit(Number(limit) || 10)
            .skip(skip)
            .sort({ createdAt: -1 })
            .populate('whitePlayer', 'username profilePicture fullname isOnline _id')
            .populate('blackPlayer', 'username profilePicture fullname isOnline _id')
    
        const total = await Game.countDocuments(query);
    
        res.status(200).json({
            success: true,
            message: "Games fetched successfully",
            data: {
                games: games,
                pagination: {
                    total: total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                }
            }
        })
    }catch(err){
        next(err);
    }
}

export const getGameById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;

        if(!gameId) {
            const error = new CustomError('Game ID is required', 400);
            throw error;
        }
        
        const game = await Game.findById(gameId)
          .populate('whitePlayer', 'username profilePicture fullname isOnline _id')
          .populate('blackPlayer', 'username profilePicture fullname isOnline _id');
          
        if (!game) {
            const error = new CustomError('Game not found', 404);
            throw error;
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Game details fetched successfully',
            data: game
        });
    } catch (error) {
        next(error);
    }
}