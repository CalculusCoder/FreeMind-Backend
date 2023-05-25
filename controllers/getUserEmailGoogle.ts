import { Request, Response } from "express";
import { queryDB } from "../db/db";

function getAdditionalDataHandler(req: Request, res: Response) {
  const email = req.query.email as string;
  console.log(email);

  if (!email) {
    res.status(400).json({ error: "Email not provided" });
    return;
  }

  const QueryStatement = {
    text: 'SELECT id, username, profile_pic_id, stripe_customer_id FROM "Freemind".users WHERE email = $1',
    values: [email],
  };

  queryDB(QueryStatement, (err: Error, result: any) => {
    if (err) {
      console.error("Database query error", err);
      res.status(500).json({ error: "Database query error" });
    } else {
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(user);
        res.json(user);
      } else {
        console.log("User not found");
        res.status(404).json({ error: "User not found" });
      }
    }
  });
}

export { getAdditionalDataHandler };
