// this is a database configuration file to connect to Postgres using 'postgres' library

import dotenv from "dotenv";
dotenv.config();
import postgres from "postgres";

// this creates a postgres client using connection details from .env file
const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});


export default sql;
