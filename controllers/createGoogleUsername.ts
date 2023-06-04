import { Request, Response } from "express";
import { queryDB } from "../db/db";
import * as Yup from "yup";
import { QueryConfig, QueryResult } from "pg";

const userSchema = Yup.object().shape({
  forumUserName: Yup.string()
    .min(5, "Username must be at least 5 characters")
    .required("Username Required"),
});

async function createGoogleUsername(
  req: Request,
  res: Response
): Promise<void> {
  const { email, forumUserName } = req.body;

  try {
    await userSchema.validate({
      forumUserName,
    });

    // Update query to include the forumUserName
    const QueryStatement: QueryConfig = {
      text: `UPDATE "Freemind".users SET username = $2 WHERE email = $1`,
      values: [email, forumUserName],
    };

    queryDB(QueryStatement, (err: Error, result: QueryResult) => {
      if (err) {
        console.error(err);
        if (
          err.message.includes(
            'duplicate key value violates unique constraint "users_UserName_key"'
          )
        ) {
          return res.status(400).json({
            error: "Username already exists. Please choose a different one.",
          });
        } else {
          return res.status(500).json({ error: "Update Failed" });
        }
      }
      res.status(200).json({ message: "Username updated successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error });
  }
}

export { createGoogleUsername };
