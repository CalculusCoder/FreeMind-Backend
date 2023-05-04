import express from "express";
import { router } from "./routes/routes";
import { connectDB } from "./db/db";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = 5000;

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", router);

connectDB();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
