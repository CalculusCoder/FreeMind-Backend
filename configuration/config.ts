import { PoolConfig } from "pg";

let db: PoolConfig;

if (process.env.NODE_ENV === "production") {
  db = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  db = {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  };
}

export { db };
