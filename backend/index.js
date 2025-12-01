// here lives the express app and this is the main entry point

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import ApolloServerInstance from "./graphql/server.js";
import redisClient from "./redis/redisConnection.js"; 
import { redisSession } from "./redis/redisConnection.js";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(redisSession);

app.get("/redis" , (req, res) => {
   req.session.test = "HOLA MFFFF";
   res.json({ message: "Session set in Redis", session: req.session });
});


async function startServer() {
  await ApolloServerInstance.start();
  ApolloServerInstance.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
