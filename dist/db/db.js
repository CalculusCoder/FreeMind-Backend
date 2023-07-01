"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDB = exports.connectDB = exports.pool = void 0;
const pg_1 = require("pg");
const config_1 = require("../configuration/config");
exports.pool = new pg_1.Pool(config_1.db);
function connectDB() {
    exports.pool.query("SELECT NOW()", (err, res) => {
        if (err) {
            console.error("Database connection error", err);
        }
        else {
            console.log("Database connected");
        }
    });
}
exports.connectDB = connectDB;
function queryDB(query) {
    return new Promise((resolve, reject) => {
        exports.pool.query(query, (err, res) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}
exports.queryDB = queryDB;
//# sourceMappingURL=db.js.map