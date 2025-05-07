import { TimeFormats, TimeFrame } from "@/models/GameUtilityTypes";
import { API_BASE_URL } from "./env";

const API_ENDPOINTS = {
    auth:{
        signIn: `${API_BASE_URL}/auth/sign-in`,
        signUp: `${API_BASE_URL}/auth/sign-up`,
        signOut: `${API_BASE_URL}/auth/sign-out`,
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
    }
};
  
export default API_ENDPOINTS; 
  