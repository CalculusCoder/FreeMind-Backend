"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
require("dotenv").config();
const routes_1 = require("./routes/routes");
const db_1 = require("./db/db");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({
    limit: "5mb",
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    },
}));
app.use((0, cookie_parser_1.default)());
app.use("/", routes_1.router);
(0, db_1.connectDB)();
app.listen(port);
//# sourceMappingURL=server.js.map