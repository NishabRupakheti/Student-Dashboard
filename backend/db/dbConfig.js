import dotenv from "dotenv";
dotenv.config();
import postgres from "postgres";

const sql = postgres({
  host: process.env.DB_HOST, // matches the service name in docker-compose
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export default sql;
