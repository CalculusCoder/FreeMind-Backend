"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Sentry = __importStar(require("@sentry/node"));
require("./controllers/resetAPIUsage");
Sentry.init({
    dsn: "https://8ff1c5c6cea94a11b73c6ee0ab172eca@o4505376459128832.ingest.sentry.io/4505376459128832",
    tracesSampleRate: 1.0,
});
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
const corsOptions = {
    origin: ["http://localhost:3000", "https://www.freemindrecovery.com"],
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