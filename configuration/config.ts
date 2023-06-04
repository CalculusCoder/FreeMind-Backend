// export {};
// export const db = {
//   connectionString: process.env.DATABASE_URL,
//   ssl: false,
//   user: "postgres",
//   password: "Emanuel12",
//   database: "postgres",
//   host: "localhost",
//   port: 5432,
// };

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
