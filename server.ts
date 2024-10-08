const express = require("express");
require("dotenv").config();
import { router } from "./routes/routes";
import { connectDB } from "./db/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ExtendedRequest } from "./types";
import { Buffer } from "buffer";
import * as Sentry from "@sentry/node";
import "./controllers/resetAPIUsage";

Sentry.init({
  dsn: "https://8ff1c5c6cea94a11b73c6ee0ab172eca@o4505376459128832.ingest.sentry.io/4505376459128832",

  tracesSampleRate: 1.0,
});

const app = express();
let port: number | string | undefined = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

const corsOptions = {
  origin: ["http://localhost:3000", "https://www.freemindrecovery.com"],
  credentials: true,
  exposedHeaders: ["Content-Disposition"],
};

app.use(express.static("images"));

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    limit: "5mb",
    verify: (req: ExtendedRequest, res: any, buf: Buffer) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());

app.use("/", router);

connectDB();

app.listen(port);
