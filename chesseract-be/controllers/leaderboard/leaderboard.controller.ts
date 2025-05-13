import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../utils/CustomError.ts';
import User from '../../models/user.model.ts';
import { Types } from 'mongoose';
import { TimeFormat } from '../../types/TimeFormat.ts';

const calculateGamesPlayed = (stats: any) => {
    return stats ? stats.gamesPlayed || 0 : 0;
};

type puzzleFormat = 'survival' | 'threeMinute' | 'fiveMinute';

export const getTopPlayersByRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { format } = req.params;
        const { country } = req.query;
        const userId = req.user?.userId;
        
        if (!['bullet', 'blitz', 'rapid'].includes(format)) {
            throw new CustomError('Invalid format. Must be bullet, blitz, or rapid', 400);
        }
        
        const formatPath = `rating.${format}`;
        
        const query: any = {};
        if (country && country !== "null") {
            query.country = country
        }
        
        // Get top 5 players
        const topPlayers = await User.find(query)
            .sort({ [formatPath]: -1 })
            .limit(5)
            .select(`username profilePicture country rating.${format} stats.${format} _id`);
            
        // Get user's rank if authenticated
        let userRank = null;
        let userData = null;
        
        if (userId) {
            const user = await User.findById(userId).select(`rating.${format}`);
            if (!user) throw new CustomError("User not found", 404);

            const higherRatedCount = await User.countDocuments({
                ...query,
                [formatPath]: { $gt: user.rating[format as TimeFormat] },
                _id: { $ne: userId }
            });
            
            userRank = higherRatedCount + 1;
            
            // Get user data
            userData = await User.findById(userId)
                .select(`username profilePicture country rating.${format} stats.${format}`);
        }
        
        res.status(200).json({
            success: true,
            message: 'Top players(rating) fetched successfully',
            data: {
                topPlayers,
                userRank,
                userData
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTopPlayersByPuzzleScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { format } = req.params;
        const { country } = req.query;
        const userId = req.user?.userId;
        
        if (!['survival', 'threeMinute', 'fiveMinute'].includes(format)) {
            throw new CustomError('Invalid format. Must be survival, threeMinute, or fiveMinute', 400);
        }
        
        const formatPath = `puzzleScores.${format}`;
        
        const query: any = {};
        if (country && country !== "null") {
            query.country = country;
        }
        
        // Get top 5 players
        const topPlayers = await User.find(query)
            .sort({ [formatPath]: -1 })
            .limit(5)
            .select(`username profilePicture country puzzleScores.${format} _id`);
            
        let userRank = null;
        let userData = null;
        
        if (userId) {
            const user = await User.findById(userId).select(`puzzleScores.${format}`);
            if (!user) throw new CustomError("User not found", 404);
            
            const higherScoredCount = await User.countDocuments({
                ...query,
                [formatPath]: { $gt: user.puzzleScores[format as puzzleFormat] },
                _id: { $ne: userId }
            });
            
            userRank = higherScoredCount + 1;
            
            // Get user data
            userData = await User.findById(userId)
                .select(`username profilePicture country puzzleScores.${format}`);
        }
        
        res.status(200).json({
            success: true,
            message: 'Top players(puzzle) fetched successfully',
            data: {
                topPlayers,
                userRank,
                userData
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTopPlayersByGamesPlayed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { country } = req.query;
        
        const query: any = {};
        if (country && country !== "null") {
            query.country = country;
        }
        
        // Get all users for sorting by total games played
        const users = await User.find(query)
            .select('username profilePicture country stats.bullet stats.blitz stats.rapid _id');
        
        // Calculate total games and sort
        const usersWithTotalGames = users.map(user => {
            const bulletGames = calculateGamesPlayed(user.stats.bullet);
            const blitzGames = calculateGamesPlayed(user.stats.blitz);
            const rapidGames = calculateGamesPlayed(user.stats.rapid);
            const totalGames = bulletGames + blitzGames + rapidGames;
            
            return {
                _id: user._id,
                username: user.username,
                profilePicture: user.profilePicture,
                country: user.country,
                totalGamesPlayed: totalGames,
                gamesByFormat: {
                    bullet: bulletGames,
                    blitz: blitzGames,
                    rapid: rapidGames
                }
            };
        });
        
        // Sort by total games and get top 3
        const topPlayers = usersWithTotalGames
            .sort((a, b) => b.totalGamesPlayed - a.totalGamesPlayed)
            .slice(0, 3);
            
        res.status(200).json({
            success: true,
            message: 'Top players(games played) fetched successfully',
            data: {
                topPlayers
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTopFriendsByRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { format } = req.params;
        const { country } = req.query;
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new CustomError('Authentication required', 401);
        }
        
        if (!['bullet', 'blitz', 'rapid'].includes(format)) {
            throw new CustomError('Invalid format. Must be bullet, blitz, or rapid', 400);
        }
        
        // Get user with friends list
        const user = await User.findById(userId).select('friends');
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        
        // Include the user in the friends list for ranking
        const friendIds = [...user.friends, userId];
        
        // Build query based on parameters
        const query: any = {
            _id: { $in: friendIds }
        };
        if (country && country !== "null") {
            query.country = country;
        }
        
        const formatPath = `rating.${format}`;
        
        // Get all friends sorted by rating
        const rankedFriends = await User.find(query)
            .sort({ [formatPath]: -1 })
            .select(`username profilePicture country rating.${format} stats.${format} _id`);
            
        // Get top 5 friends
        const topFriends = rankedFriends.slice(0, 5);
        
        // Find user's rank among friends
        const userRank = rankedFriends.findIndex(friend => (friend._id as Types.ObjectId).toString() === userId.toString()) + 1;
        
        // Get user data
        const userData = rankedFriends.find(friend => (friend._id as Types.ObjectId).toString() === userId.toString());
        
        res.status(200).json({
            success: true,
            message: 'Top friends(rating) fetched successfully',
            data: {
                topFriends,
                userRank,
                userData,
                totalFriends: rankedFriends.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTopFriendsByPuzzleScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { format } = req.params;
        const { country } = req.query;
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new CustomError('Authentication required', 401);
        }
        
        if (!['survival', 'threeMinute', 'fiveMinute'].includes(format)) {
            throw new CustomError('Invalid format. Must be survival, threeMinute, or fiveMinute', 400);
        }
        
        // Get user with friends list
        const user = await User.findById(userId).select('friends');
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        
        // Include the user in the friends list for ranking
        const friendIds = [...user.friends, userId];
        
        // Build query based on parameters
        const query: any = {
            _id: { $in: friendIds }
        };
        if (country && country !== "null") {
            query.country = country;
        }
        
        const formatPath = `puzzleScores.${format}`;
        
        // Get all friends sorted by puzzle score
        const rankedFriends = await User.find(query)
            .sort({ [formatPath]: -1 })
            .select(`username profilePicture country puzzleScores.${format} _id`);
            
        // Get top 5 friends
        const topFriends = rankedFriends.slice(0, 5);
        
        // Find user's rank among friends
        const userRank = rankedFriends.findIndex(friend => (friend._id as Types.ObjectId).toString() === userId.toString()) + 1;
        
        // Get user data
        const userData = rankedFriends.find(friend => (friend._id as Types.ObjectId).toString() === userId.toString());
        
        res.status(200).json({
            success: true,
            message: 'Top friends(puzzle) fetched successfully',
            data: {
                topFriends,
                userRank,
                userData,
                totalFriends: rankedFriends.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTopFriendsByRatingJump = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new CustomError('Authentication required', 401);
        }
        
        // Get user with friends list
        const user = await User.findById(userId).select('friends');
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        
        // Include the user in the friends list for ranking
        const friendIds = [...user.friends, userId];
        
        // Get all friends
        const friends = await User.find({ _id: { $in: friendIds } })
            .select('username profilePicture country rating ratingHistory _id');
            
        // Calculate rating changes in the last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const friendsWithRatingJumps = friends.map(friend => {
            const ratingJumps = {
                bullet: 0,
                blitz: 0, 
                rapid: 0,
                total: 0
            };
            
            // Calculate jumps for each format
            (['bullet', 'blitz', 'rapid'] as const).forEach(format => {
                const history = friend.ratingHistory[format];
                if (history && history.length > 0) {
                    // Get the most recent rating from a week ago
                    const weekOldRating = history
                        .filter(entry => new Date(entry.date) <= oneWeekAgo)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    
                    if (weekOldRating) {
                        // Current rating minus week-old rating
                        ratingJumps[format] = friend.rating[format] - weekOldRating.rating;
                    }
                }
            });
            
            // Calculate total rating jump across all formats
            ratingJumps.total = ratingJumps.bullet + ratingJumps.blitz + ratingJumps.rapid;
            
            return {
                _id: friend._id,
                username: friend.username,
                profilePicture: friend.profilePicture,
                country: friend.country,
                ratingJumps
            };
        });
        
        // Sort by total rating jump
        const rankedFriends = friendsWithRatingJumps
            .sort((a, b) => b.ratingJumps.total - a.ratingJumps.total);
            
        // Get top 5 friends
        const topFriends = rankedFriends.slice(0, 5);
        
        // Find user's rank among friends
        const userRank = rankedFriends.findIndex(friend => (friend._id as Types.ObjectId).toString() === userId.toString()) + 1;
        
        // Get user data
        const userData = rankedFriends.find(friend => (friend._id as Types.ObjectId).toString() === userId.toString());
        
        res.status(200).json({
            success: true,
            data: {
                topFriends,
                userRank,
                userData,
                totalFriends: rankedFriends.length
            }
        });
    } catch (error) {
        next(error);
    }
};