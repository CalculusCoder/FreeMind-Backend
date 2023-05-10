import { Request, Response } from "express";
import { Pool, QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";
const bcrypt = require("bcrypt");

async function checkMembership(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  const checkMembershipQuery = {
    text: 'SELECT access_expiration FROM "Freemind".users WHERE email=$1',
    values: [email],
  };

  queryDB(checkMembershipQuery, (err: Error, result: QueryResult) => {
    if (err) {
      console.error("Error checking user membership:", err);
      res.status(500).json({ error: "Error checking user membership" });
      return;
    }

    if (result.rowCount === 0) {
      console.error("No user found with the given email");
      res.status(404).json({ error: "No user found with the given email" });
      return;
    } else {
      const access_expiration = result.rows[0].access_expiration;
      res.status(200).json({ access_expiration });
    }
  });
}

export { checkMembership };
