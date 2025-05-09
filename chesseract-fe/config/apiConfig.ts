import { TimeFormats, TimeFrame } from "@/models/GameUtilityTypes";
import { API_BASE_URL } from "./env";

const API_ENDPOINTS = {
    auth:{
        signIn: `${API_BASE_URL}/auth/sign-in`, //post
        signUp: `${API_BASE_URL}/auth/sign-up`, //post
        signOut: `${API_BASE_URL}/auth/sign-out`, //post
    },
    users:{
        getAll : `${API_BASE_URL}/users`, //get
        getById : (id: string) => `${API_BASE_URL}/users/${id}`, //get
        editProfile : `${API_BASE_URL}/users`,  //put
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
        getAllFriends: (userId: string, limit: number | null, page: number | null) => `${API_BASE_URL}/friends/${userId}?limit=${limit}&page=${page}`, //get
        sendRequest: `${API_BASE_URL}/friends/request`, //post
        acceptRequest: `${API_BASE_URL}/friends/accept`, //put
        rejectRequest: `${API_BASE_URL}/friends/reject`, //put
        removeFriends: (friendId: string) => `${API_BASE_URL}/friends/${friendId}`, //delete
        cancelRequest: (friendId: string) => `${API_BASE_URL}/friends/request/${friendId}`, //delete
    },
    puzzles:{
        getInitialBatch: (startRating: number | null, endRating: number | null, batchSize: number | null) => `${API_BASE_URL}/puzzles/initial-batch?startRating=${startRating}&endRating=${endRating}&batchSize=${batchSize}`, //get
        getNextBatch: (currentEndRating: number | null, batchSize: number | null) => `${API_BASE_URL}/puzzles/next-batch?currentEndRating=${currentEndRating}&batchSize=${batchSize}`, //get
        getScore: (userId: string) => `${API_BASE_URL}/puzzles/user-score/${userId}`, //get
        updateScore: `${API_BASE_URL}/puzzles/user-score`, //put
    }
};
  
export default API_ENDPOINTS; 
  