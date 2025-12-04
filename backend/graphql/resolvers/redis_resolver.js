// this resolver is for redis related operations ... like checking connection status, setting and getting test data
import redisClient from "../../redis/redisConnection.js";

export const RedisResolvers = {

  Query: { // is that thing alive ???? 
    redisStatus: async () => {
      try {
        const pong = await redisClient.ping();
        return pong === "PONG"
          ? "Redis is connected"
          : "Redis connection failed";
      } catch (error) {
        return `Redis connection error: ${error.message}`;
      }
    },

    readRedisTestData: async (_, { key }) => { // lets read a data using a key 
      try {
        const value = await redisClient.get(key);
        return value || `No data found for key: ${key}`;
      } catch (error) {
        throw new Error(`Failed to read data from Redis: ${error.message}`);
      }
    },
  },

  Mutation: {
    setRedisTestData: async (_, { key, value }) => { // sets a test data in redis
      try {
        await redisClient.set(key, value);
        return `Data set in Redis: ${key} = ${value}`;
      } catch (error) {
        throw new Error(`Failed to set data in Redis: ${error.message}`);
      }
    },
  },
};
