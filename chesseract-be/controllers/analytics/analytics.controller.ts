import { NextFunction, Request, Response } from "express";
import User from "../../models/user.model.ts";
import { CustomError } from "../../utils/CustomError.ts";
import Game from "../../models/game.model.ts";
import mongoose from "mongoose";

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { format } = req.query;
        
        const user = await User.findById(userId).select('stats rating');
        
        if (!user) {
            const error = new CustomError("User not found", 404);
            throw error;
        }
        
        // Return stats for specific format or all formats
        if (format && ['bullet', 'blitz', 'rapid'].includes(format as string)) {
            res.status(200).json({ 
                success: true,
                message: "User stats fetched successfully",
                data: {
                    stats: user.stats[format as keyof typeof user.stats],
                    rating: user.rating[format as keyof typeof user.rating]
                }
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: "User stats fetched successfully",
            data: {
                stats: user.stats,
                rating: user.rating
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getUserRatingHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { format, timeframe = '1m' } = req.query;
        console.log(format, timeframe, userId);
        
        const user = await User.findById(userId);
        
        if (!user) {
            const error = new CustomError("User not found", 404);
            throw error;
        }

        const now = new Date();
        let startDate = new Date();

        switch(timeframe) {
            case '1w': // 1 week
              startDate.setDate(now.getDate() - 7);
              break;
            case '1m': // 1 month
              startDate.setMonth(now.getMonth() - 1);
              break;
            case '3m': // 3 months
              startDate.setMonth(now.getMonth() - 3);
              break;
            case '6m': // 6 months
              startDate.setMonth(now.getMonth() - 6);
              break;
            case '1y': // 1 year
              startDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              startDate.setMonth(now.getMonth() - 1); // Default to 1 month
        }

        const filteredHistory: any = {};

        if (format && ['bullet', 'blitz', 'rapid'].includes(format as string)) {
            // For a specific format
            const formatHistory = user.ratingHistory[format as keyof typeof user.ratingHistory] || [];
            filteredHistory[format as keyof typeof user.ratingHistory] = formatHistory.filter(
                (entry: any) => new Date(entry.date) >= startDate
            );
        } else {
            // For all formats
            for (const key of ['bullet', 'blitz', 'rapid']) {
                const formatHistory = user.ratingHistory[key as keyof typeof user.ratingHistory] || [];
                filteredHistory[key] = formatHistory.filter(
                    (entry: any) => new Date(entry.date) >= startDate
                );
            }
        }
        
        res.status(200).json({ 
            success: true,
            message: "User rating history fetched successfully",
            data: filteredHistory
        });
    } catch (error) {
        next(error);
    }
}

export const getAdvancedAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { format } = req.query;
        
        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            const error = new CustomError("User not found", 404);
            throw error;
        }
        
        // Prepare format filter for MongoDB queries
        let timeControlFilter: any = {};
        
        if (format) {
            timeControlFilter = { 'format': format };
        }
        
        // Calculate winrate as white and black
        const colorStats = await Game.aggregate([
        {
            $match: {
            $and: [
                { status: 'finished' },
                timeControlFilter,
                {
                $or: [
                    { whitePlayer: new mongoose.Types.ObjectId(userId) },
                    { blackPlayer: new mongoose.Types.ObjectId(userId) }
                ]
                }
            ]
            }
        },
        {
            $facet: {
            asWhite: [
                { $match: { whitePlayer: new mongoose.Types.ObjectId(userId) } },
                { $group: {
                _id: '$winner',
                count: { $sum: 1 }
                }}
            ],
            asBlack: [
                { $match: { blackPlayer: new mongoose.Types.ObjectId(userId) } },
                { $group: {
                _id: '$winner',
                count: { $sum: 1 }
                }}
            ],
            resultReasons: [
                { $group: {
                _id: '$resultReason',
                count: { $sum: 1 }
                }}
            ],
            averageGameLength: [
                { $project: { movesCount: { $size: '$moves' } } },
                { $group: {
                _id: null,
                average: { $avg: '$movesCount' }
                }}
            ],
            totalGames: [
                { $count: 'count' }
            ]
            }
        }
        ]);
        
        // Process the aggregation results
        const analytics = {
        colorPerformance: {
            asWhite: {
            wins: 0,
            losses: 0,
            draws: 0,
            total: 0
            },
            asBlack: {
            wins: 0,
            losses: 0,
            draws: 0,
            total: 0
            }
        },
        resultReasons: {},
        averageGameLength: 0,
        totalGames: 0
        };
        
        // Process white games
        if (colorStats[0]?.asWhite) {
            for (const result of colorStats[0].asWhite) {
                if (result._id === 'white') analytics.colorPerformance.asWhite.wins = result.count;
                else if (result._id === 'black') analytics.colorPerformance.asWhite.losses = result.count;
                else if (result._id === 'draw') analytics.colorPerformance.asWhite.draws = result.count;
                
                analytics.colorPerformance.asWhite.total += result.count;
            }
        }
        
        // Process black games
        if (colorStats[0]?.asBlack) {
            for (const result of colorStats[0].asBlack) {
                if (result._id === 'black') analytics.colorPerformance.asBlack.wins = result.count;
                else if (result._id === 'white') analytics.colorPerformance.asBlack.losses = result.count;
                else if (result._id === 'draw') analytics.colorPerformance.asBlack.draws = result.count;
                
                analytics.colorPerformance.asBlack.total += result.count;
            }
        }
        
        // Process result reasons
        if (colorStats[0]?.resultReasons) {
            analytics.resultReasons = colorStats[0].resultReasons.reduce((acc: any, item: any) => {
                acc[item._id || 'unknown'] = item.count;
                return acc;
            }, {});
        }
        
        // Process average game length
        if (colorStats[0]?.averageGameLength?.[0]) {
            analytics.averageGameLength = Math.round(colorStats[0].averageGameLength[0].average);
        }
        
        // Process total games
        if (colorStats[0]?.totalGames?.[0]) {
            analytics.totalGames = colorStats[0].totalGames[0].count;
        }
        
        res.status(200).json({ 
            success: true,
            message: "Advanced analytics fetched successfully",
            data: analytics
        });
    } catch (error) {
        next(error);
    }
}