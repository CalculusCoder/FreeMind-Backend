export {};
export const db = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // user: "postgres",
  // password: "Emanuel12",
  // database: "postgres",
  // host: "localhost",
  // port: 5432,
};
