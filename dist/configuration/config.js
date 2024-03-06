"use strict";
// export {};
// export const db = {
//   connectionString: "postgresql://postgres:Emanuel12@localhost:5432/freemind",
//   ssl: false,
//   user: "postgres",
//   password: "Emanuel12",
//   database: "freemind",
//   host: "localhost",
//   port: 5432,
// };
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
let db;
exports.db = db;
if (process.env.NODE_ENV === "production") {
    exports.db = db = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    };
}
else {
    exports.db = db = {
        connectionString: process.env.DATABASE_URL,
        ssl: false,
    };
}
//# sourceMappingURL=config.js.map