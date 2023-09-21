import { config } from "dotenv";

config();
export const GITHUB_ID = process.env.GITHUB_ID;
export const GITHUB_SECRET = process.env.GITHUB_SECRET;
export const DB_URL = process.env.DB_URL;
export const SECRET_KEY = process.env.SECRET_KEY;
export const PORT = process.env.PORT;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
export const GMAIL = process.env.GMAIL;
export const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
