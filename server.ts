import express from "express";
import { router } from "./routes/routes";
import { connectDB } from "./db/db";

const app = express();
const port = 5000;

app.use(express.json());
app.use("/", router);

connectDB();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
