import dotenv from "dotenv";
dotenv.config();
import postgres from "postgres";

const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    await sql`SELECT 1+1 AS result`;
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testConnection();

export default sql;
