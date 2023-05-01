export {};
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "../configuration/config";

const pool = new Pool(db);

function connectDB(): void {
  pool.query("SELECT NOW()", (err: Error, res: QueryResult) => {
    if (err) {
      console.error("Database connection error", err);
    } else {
      console.log("Database connected");
    }
  });
}

function queryDB(
  query: QueryConfig,
  callback: (err: Error, result: QueryResult) => void
): void {
  pool.query(query, callback);
}

export { connectDB, queryDB };
