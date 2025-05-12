import express from 'express';
import {
    getTopPlayersByRating,
    getTopPlayersByPuzzleScore,
    getTopPlayersByGamesPlayed,
    getTopFriendsByRating,
    getTopFriendsByPuzzleScore,
    getTopFriendsByRatingJump
} from '../controllers/leaderboard/leaderboard.controller.ts';
import authorize from '../middlewares/auth.middleware.ts';

const leaderboardRouter = express.Router();

// Public leaderboards (with optional auth for getting user's rank)
leaderboardRouter.get('/rating/:format', authorize, getTopPlayersByRating);
leaderboardRouter.get('/puzzle/:format', authorize, getTopPlayersByPuzzleScore);
leaderboardRouter.get('/games-played', getTopPlayersByGamesPlayed);

// Friend leaderboards (requires auth)
leaderboardRouter.get('/friends/rating/:format', authorize, getTopFriendsByRating);
leaderboardRouter.get('/friends/puzzle/:format', authorize, getTopFriendsByPuzzleScore);
leaderboardRouter.get('/friends/rating-jump', authorize, getTopFriendsByRatingJump);

export default leaderboardRouter;