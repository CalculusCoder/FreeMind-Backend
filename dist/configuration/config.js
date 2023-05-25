"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.db = {
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
//# sourceMappingURL=config.js.map