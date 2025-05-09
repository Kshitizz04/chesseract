import { NextFunction, Request, Response } from "express";
import Puzzle from "../../models/puzzle.model.ts";
import { CustomError } from "../../utils/CustomError.ts";

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
        console.error("Error fetching next puzzle batch:", error);
        res.status(500).json({ message: "Server error" });
    }
};

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