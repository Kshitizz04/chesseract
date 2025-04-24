import { API_BASE_URL } from "./env";

const API_ENDPOINTS = {
    auth:{
        signIn: `${API_BASE_URL}/auth/sign-in`,
        signUp: `${API_BASE_URL}/auth/sign-up`,
        signOut: `${API_BASE_URL}/auth/sign-out`,
    },
    users:{
        getAll : `${API_BASE_URL}/users`,
        getById : (id: string) => `${API_BASE_URL}/users/${id}`,
    }
};
  
export default API_ENDPOINTS; 
  