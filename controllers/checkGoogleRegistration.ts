import { Request, Response } from "express";
import { queryDB } from "../db/db";

async function checkGoogleRegistration(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Get the user email from the query parameters
    const email = req.query.email as string;

    // SQL statement to check if the user with the given email exists
    const QueryStatement = {
      text: `SELECT * FROM "Freemind".users WHERE email = $1`,
      values: [email],
    };

    // Query the database
    const result = await queryDB(QueryStatement);

    if (result.rows.length > 0) {
      // If the user exists, return a response indicating that the user is registered
      res.json({ isRegistered: true });
    } else {
      // If the user does not exist, return a response indicating that the user is not registered
      res.json({ isRegistered: false });
    }
  } catch (error) {
    console.error("Error occurred", error);
    res.status(500).send("Error occurred");
  }
}

export { checkGoogleRegistration };
