export interface IJwtPayload {
    userId: string | number;
    iat?: number;  
    exp?: number;  
    nbf?: number;   
}