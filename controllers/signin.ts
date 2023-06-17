import { Request, Response } from "express";
import { queryDB } from "../db/db";
const bcrypt = require("bcrypt");

function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const QueryStatement = {
      text: 'SELECT * FROM "Freemind".users WHERE email = $1',
      values: [email],
    };

    queryDB(QueryStatement, async (err: Error, result: any) => {
      try {
        if (err) {
          console.error("Database query error", err);
          res.status(500).json({ error: "Database query error" });
        }
        if (result.rows.length > 0) {
          const user = result.rows[0];
          if (user.password === null) {
            return res.status(402).json({
              error:
                "User used Google authentication to register. Please sign in with Google.",
            });
          }
          const isMatch = await bcrypt.compare(password, user.password);

          if (isMatch) {
            res.json({
              id: user.id,
              email: user.email,
              username: user.username,
              profile_pic_id: user.profile_pic_id,
              stripe_customer_id: user.stripe_customer_id,
            });
          } else {
            console.log("Invalid Email or Password");
            res.status(401).json({ error: "Invalid Email or Password" });
          }
        } else {
          console.log("Invalid Email or Password");
          res.status(404).json({ error: "Invalid Email or Password" });
        }
      } catch (innerError) {
        console.error("Error occurred inside callback", innerError);
        return res.status(500).send("Error occurred");
      }
    });
  } catch (error) {
    console.error("Error occurred", error);
    res.status(500).send("Error occurred");
  }
}
export { loginHandler };
