import { Request, Response } from "express";
import { queryDB } from "../db/db";
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";

function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log("Received request:", req.body);

  try {
    const QueryStatement = {
      text: 'SELECT * FROM "Freemind".users WHERE email = $1 AND ismember = true',
      values: [email],
    };

    queryDB(QueryStatement, async (err: Error, result: any) => {
      if (err) {
        console.error("Database query error", err);
        res.status(500).json({ error: "Database query error" });
      } else {
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const isMatch = await bcrypt.compare(password, user.password);

          if (isMatch) {
            console.log("User authentication successful");
            res.json({
              id: user.id,
              email: user.email,
            });
          } else {
            console.log("Invalid Email or Password");
            res.status(401).json({ error: "Invalid Email or Password" });
          }
        } else {
          console.log("Invalid Email or Password");
          res.status(404).json({ error: "Invalid Email or Password" });
        }
      }
    });
  } catch (error) {
    console.error("Error occurred", error);
    res.status(500).send("Error occurred");
  }
}

export { loginHandler };
