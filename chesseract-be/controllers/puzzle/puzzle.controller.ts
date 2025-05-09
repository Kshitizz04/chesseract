import { NextFunction, Request, Response } from "express";
import Puzzle from "../../models/puzzle.model.ts";
import { CustomError } from "../../utils/CustomError.ts";
import User from "../../models/user.model.ts";
import { UpdateUserScoreBody } from "./puzzle.types.ts";

export const getInitialBatch = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const startRating = Number(req.query.startRating) || 400;
        const endRating = Number(req.query.endRating) || 1000;
        const batchSize = Number(req.query.batchSize) || 10;
        
        const puzzles = await getProgressivePuzzleBatch(startRating, endRating, batchSize);
        
        if (!puzzles || puzzles.length === 0) {
            const error = new CustomError("No puzzles found in this rating range", 404);
            throw error;
        }
        
        res.json({ 
            success: true,
            message: "Initial puzzle batch fetched successfully",
            data: { 
                puzzles: puzzles ,
                endRating: endRating,
            },
        });
    } catch (error) {
        next(error);
    }
}

export const getNextBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let currentEndRating = Number(req.query.currentEndRating) || 1000;
        let nextEndRating = currentEndRating + 500; // Increase the end rating
        let startRating = currentEndRating - 100; // Slight overlap with previous batch
        if (currentEndRating>3000){
            currentEndRating = 2800;
            nextEndRating = 3001;
            startRating = 2800;
        }
        const batchSize = Number(req.query.batchSize) || 10;
        
        const puzzles = await getProgressivePuzzleBatch(startRating, nextEndRating, batchSize);
        
        if (!puzzles || puzzles.length === 0) {
            const error = new CustomError("No puzzles found in this rating range", 404);
            throw error;
        }
        
        res.json({ 
            success: true,
            message: "Initial puzzle batch fetched successfully",
            data: { 
                puzzles: puzzles ,
                endRating: nextEndRating,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUserScoreById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        
        const user = await User.findById(userId).select("puzzleScores");
        
        if (!user) {
            const error = new CustomError("User not found", 404);
            throw error;
        }
        
        res.json({ 
            success: true,
            message: "User puzzle score fetched successfully",
            data: { 
                survival: user.puzzleScores.survival,
                threeMinute: user.puzzleScores.threeMinute,
                fiveMinute: user.puzzleScores.fiveMinute,
            },
        });
    }catch (error) {
        next(error);
    }
}

export const updateUserScore = async (req: Request<{}, any, UpdateUserScoreBody>, res: Response, next: NextFunction) => {
    try{
        const userId = req.user?.userId;
        const { survival, threeMinute, fiveMinute } = req.body;
        
        if(!userId){
            const error = new CustomError("User not found", 404);
            throw error;
        }

        const user = await User.findById(userId);

        if (!user) {
            const error = new CustomError("User not found", 404);
            throw error;
        }
        if (survival) {
            if(survival > user.puzzleScores.survival){
                user.puzzleScores.survival = survival;
            }
        }
        if(threeMinute) {
            if(threeMinute > user.puzzleScores.threeMinute){
                user.puzzleScores.threeMinute = threeMinute;
            }
        }
        if(fiveMinute) {
            if(fiveMinute > user.puzzleScores.fiveMinute){
                user.puzzleScores.fiveMinute = fiveMinute;
            }
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: "User puzzle score updated successfully",
            data: {
                survival: user.puzzleScores.survival,
                threeMinute: user.puzzleScores.threeMinute,
                fiveMinute: user.puzzleScores.fiveMinute,
            },
        })
    }catch(err){
        next(err);
    }
}

async function getProgressivePuzzleBatch(startRating: number, endRating: number, batchSize: number) {
    const ratingStep = (endRating - startRating) / (batchSize - 1);
    
    const puzzles = [];
    
    for (let i = 0; i < batchSize; i++) {
        const minRating = Math.round(startRating + (i * ratingStep));
        const maxRating = Math.round(minRating + ratingStep);
        
        const puzzle = await getRandomPuzzleFromRange(minRating, maxRating);
        
        if (puzzle) {
            puzzles.push(puzzle);
        }
    }
    
    return puzzles;
}

async function getRandomPuzzleFromRange(minRating: number, maxRating: number) {
    const query = {
        Rating: { $gte: minRating, $lte: maxRating }
    };
    
    const randomPuzzles = await Puzzle.aggregate([
        { $match: query },
        { $sample: { size: 1 } }
    ]);
    
    return randomPuzzles.length > 0 ? randomPuzzles[0] : null;
}