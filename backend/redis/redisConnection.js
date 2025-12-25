import { createClient } from "redis"; // Standard Redis client
import session from "express-session"; // handles session logic in express (create, save and read cookies)
import { RedisStore } from "connect-redis";
import dotenv from "dotenv";
dotenv.config();

// create a redis connection using standard redis client
const redisClient = createClient({
  url: "redis://redis:6379",
});

// Handle Redis connection errors
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));

// Connect to Redis server
await redisClient.connect();

export const redisSession = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false, // Temporarily false for debugging
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
});

export default redisClient;
