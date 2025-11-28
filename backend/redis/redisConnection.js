import Redis from "ioredis"; // a Redis client for Node.js that connects node to Redis server
import session from "express-session"; // handles session logic in express (create, save and read cookies)
import { RedisStore } from "connect-redis";
import dotenv from "dotenv";
dotenv.config();

// create a redis connection
const redisClient = new Redis({
  host: "redis",
  port: 6379,
});

export const redisSession = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

export default redisClient;
