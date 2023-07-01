export {};
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "../configuration/config";

export const pool = new Pool(db);

function connectDB(): void {
  pool.query("SELECT NOW()", (err: Error, res: QueryResult) => {
    if (err) {
      console.error("Database connection error", err);
    } else {
      console.log("Database connected");
    }
  });
}

function queryDB(query: QueryConfig): Promise<QueryResult> {
  return new Promise((resolve, reject) => {
    pool.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

export { connectDB, queryDB };
