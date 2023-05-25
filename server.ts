const express = require("express");
require("dotenv").config();
import { router } from "./routes/routes";
import { connectDB } from "./db/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ExtendedRequest } from "./types";
import { Buffer } from "buffer";

const app = express();
let port: number | string | undefined = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

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
