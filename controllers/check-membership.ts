import { Request, Response } from "express";
import { queryDB } from "../db/db";

async function checkMembership(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    const checkMembershipQuery = {
      text: 'SELECT access_expiration FROM "Freemind".users WHERE email=$1',
      values: [email],
    };

    const result = await queryDB(checkMembershipQuery);

    if (result.rowCount === 0) {
      console.error("No user found with the given email");
      res.status(404).json({ error: "No user found with the given email" });
    } else {
      const access_expiration = result.rows[0].access_expiration;
      res.status(200).json({ access_expiration });
    }
  } catch (err) {
    console.error("Error checking user membership:", err);
    res.status(500).json({ error: "Error checking user membership" });
  }
}

export { checkMembership };
