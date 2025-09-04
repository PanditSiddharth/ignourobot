import { configDotenv } from "dotenv"
configDotenv();

export const port = process.env.PORT || 3000;
export const botToken = process.env.TOKEN;
export const testChat = process.env.TEST_CHAT;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const mongoUri = process.env.MONGO_URI;
