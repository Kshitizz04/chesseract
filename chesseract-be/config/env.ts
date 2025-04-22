import { config } from "dotenv";

config ({path: `.env.${process.env.NODE_ENV || "development"}.local`});
export const PORT: string | undefined = process.env.PORT;
export const NODE_ENV: string | undefined = process.env.NODE_ENV;
export const DB_URI: string | undefined = process.env.DB_URI;