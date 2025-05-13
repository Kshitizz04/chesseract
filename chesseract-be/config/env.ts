import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
}

export const PORT = getEnvVar("PORT") || "5000";
export const NODE_ENV = getEnvVar("NODE_ENV");
export const DB_URI = getEnvVar("DB_URI");
export const JWT_SECRET = getEnvVar("JWT_SECRET");
export const JWT_EXPIRES_IN = getEnvVar("JWT_EXPIRES_IN");
export const ARCJET_KEY = getEnvVar("ARCJET_KEY");
export const ARCJET_ENV = getEnvVar("ARCJET_ENV");