import { Request, Response } from "express";
import { queryDB } from "../db/db";
import { QueryConfig } from "pg";

export const verifyUserEmail = async (req: Request, res: Response) => {
  const { id, token } = req.body;

  try {
    // Define the SQL query to select the user's verification_token by id
    const QueryStatement: QueryConfig = {
      text: 'SELECT verification_token FROM "Freemind".users WHERE id = $1',
      values: [id],
    };

    // Execute the query
    const result = await queryDB(QueryStatement);

    // Check if a user with the given id is found
    if (result.rows.length > 0) {
      const userToken = result.rows[0].verification_token;

      // Compare the provided token with the one stored in the database
      if (token === userToken) {
        // Tokens match, update the user's verification status
        const updateStatement: QueryConfig = {
          text: 'UPDATE "Freemind".users SET is_verified = TRUE WHERE id = $1',
          values: [id],
        };

        await queryDB(updateStatement);
        res.json({ message: "User verified successfully" });
      } else {
        // Tokens do not match
        res.status(400).json({ message: "Invalid token" });
      }
    } else {
      // No user found with the given id
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred during verification." });
  }
};
