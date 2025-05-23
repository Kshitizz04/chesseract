import { PuzzleFormats, TimeFormats, TimeFrame } from "@/models/GameUtilityTypes";
import { API_BASE_URL } from "./env";

const API_ENDPOINTS = {
    auth:{
        signIn:  `${API_BASE_URL}/auth/sign-in`, //post
        signUp: `${API_BASE_URL}/auth/sign-up`, //post
        refreshToken: `${API_BASE_URL}/auth/refresh-token`, //get
    },
    users:{
        getAll : (query: string) => `${API_BASE_URL}/users?query=${query}`, //get
        getById : (id: string) => `${API_BASE_URL}/users/${id}`, //get
        editProfile : `${API_BASE_URL}/users`,  //put
        updateOnlineVisibility: `${API_BASE_URL}/users/online-visibility`, //put
        deleteAccount: `${API_BASE_URL}/users`, //delete
    },
    game: {
        getUserGames: (userId: string, format: TimeFormats | null, limit: number | null, page:number | null) => `${API_BASE_URL}/games/game-history/${userId}?format=${format}&limit=${limit}&page=${page}`, //get
        getGameById: (gameId: string) => `${API_BASE_URL}/games/game-details/${gameId}`, //get
    },
    analytics: {
        getUserStats: (userId: string, format: TimeFormats | null) => `${API_BASE_URL}/analytics/stats/${userId}?format=${format}`, //get
        getUserRatingHistory: (userId: string, format: TimeFormats | null, timeframe: TimeFrame | null) => `${API_BASE_URL}/analytics/rating-history/${userId}?format=${format}&timeframe=${timeframe}`, //get
        getAdvancedAnalytics: (userId: string, format: TimeFormats | null) => `${API_BASE_URL}/analytics/advanced-analytics/${userId}?format=${format}`, //get
    },
    friends:{
        getAllFriends: (userId: string, limit: number | null, page: number | null) => `${API_BASE_URL}/friends/all-friends/${userId}?limit=${limit}&page=${page}`, //get
        sendRequest: `${API_BASE_URL}/friends/request`, //post
        acceptRequest: `${API_BASE_URL}/friends/accept`, //put
        rejectRequest: `${API_BASE_URL}/friends/reject`, //put
        removeFriends: (friendId: string) => `${API_BASE_URL}/friends/${friendId}`, //delete
        cancelRequest: (friendId: string) => `${API_BASE_URL}/friends/request/${friendId}`, //delete
        getSuggestions: `${API_BASE_URL}/friends/suggestions`,
    },
    puzzles:{
        getInitialBatch: (startRating: number | null, endRating: number | null, batchSize: number | null) => `${API_BASE_URL}/puzzles/initial-batch?startRating=${startRating}&endRating=${endRating}&batchSize=${batchSize}`, //get
        getNextBatch: (currentEndRating: number | null, batchSize: number | null) => `${API_BASE_URL}/puzzles/next-batch?currentEndRating=${currentEndRating}&batchSize=${batchSize}`, //get
        getScore: (userId: string) => `${API_BASE_URL}/puzzles/user-score/${userId}`, //get
        updateScore: `${API_BASE_URL}/puzzles/user-score`, //put
    },
    notifications: {
        getAllNotifications: `${API_BASE_URL}/notifications`, //get
        markAsRead: `${API_BASE_URL}/notifications/mark-as-read`, //put
        handleFriendRequest: `${API_BASE_URL}/notifications/friend-request`, //put
        handleGameChallenge: `${API_BASE_URL}/notifications/game-challenge`, //put
    },
    leaderboard : {
        getTopPlayersByRating: (format: TimeFormats, country: string | null) => `${API_BASE_URL}/leaderboard/rating/${format}?country=${country}`, //get
        getTopPlayersByPuzzleScore: (format: PuzzleFormats, country: string | null) => `${API_BASE_URL}/leaderboard/puzzle/${format}?country=${country}`, //get
        getTopPlayersByGamesPlayed: (country: string | null)=>`${API_BASE_URL}/leaderboard/games-played?country=${country}`, //get
        getTopFriendsByRating: (format: TimeFormats, country: string | null) => `${API_BASE_URL}/leaderboard/friends/rating/${format}?country=${country}`, //get
        getTopFriendsByPuzzleScore: (format: PuzzleFormats, country: string | null) => `${API_BASE_URL}/leaderboard/friends/puzzle/${format}?country=${country}`, //get
        getTopFriendsByRatingJump: `${API_BASE_URL}/leaderboard/friends/rating-jump`, //get
    },
};
  
export default API_ENDPOINTS; 
  