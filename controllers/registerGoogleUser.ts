import { Request, Response, query } from "express";
import { queryDB } from "../db/db";
import * as Yup from "yup";
import { QueryConfig, QueryResult } from "pg";

const userSchema = Yup.object().shape({
  email: Yup.string().required().email(),
  fullName: Yup.string().required(),
});

async function registerGoogleUser(req: Request, res: Response): Promise<void> {
  const { email, fullName } = req.body;

  try {
    await userSchema.validate({
      email,
      fullName,
    });

    const QueryStatement: QueryConfig = {
      text: `INSERT INTO "Freemind".users (Email, fullName) VALUES ($1::text, $2::text) RETURNING id, email, fullName, profile_pic_id`,
      values: [email, fullName],
    };

    queryDB(QueryStatement, (err: Error, result: QueryResult) => {
      if (err) {
        console.error(err);
        if (
          err.message.includes(
            'duplicate key value violates unique constraint "users_email_key"'
          )
        ) {
          return res.status(400).json({
            error:
              "Email address already registered. Sign in or use a different email",
          });
        } else {
          return res.status(500).json({ error: "Registration Failed" });
        }
      }

      const user = result.rows[0];
      console.log(user);
      res.status(200).json({ user, message: "User registered successfully" });
    });
  } catch (error) {
    console.log(error);
  }
}

export { registerGoogleUser };
