import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.REDIS_URL!);

export const redis2 = new Redis(process.env.REDIS_URL!);
