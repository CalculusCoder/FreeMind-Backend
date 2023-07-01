import { Request, Response } from "express";
import { queryDB } from "../db/db";
import * as Yup from "yup";
import sgMail from "@sendgrid/mail";

const userSchema = Yup.object().shape({
  email: Yup.string().required().email(),
  fullName: Yup.string().required(),
});

if (!process.env.SENDGRID_API_KEY || !process.env.GOOGLE_EMAIL) {
  throw new Error("SENDGRID_API_KEY or GOOGLE_EMAIL is not defined");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function registerGoogleUser(req: Request, res: Response): Promise<void> {
  const { email, fullName } = req.body;

  try {
    await userSchema.validate({
      email,
      fullName,
    });

    const QueryStatement = {
      text: `INSERT INTO "Freemind".users (Email, fullName) VALUES ($1::text, $2::text) RETURNING id, email, fullName, profile_pic_id`,
      values: [email, fullName],
    };

    const result = await queryDB(QueryStatement);
    const user = result.rows[0];
    console.log(user);

    const msg = {
      to: "jaredgomez0812@gmail.com",
      from: process.env.GOOGLE_EMAIL as string,
      subject: "New Google User Registration",
      text: `A new user has registered with Google. Details: ${JSON.stringify(
        user
      )}`,
    };

    try {
      await sgMail.send(msg);
      console.log("Email sent");
      res.status(200).json({ user, message: "User registered successfully" });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (
      errorMessage.includes(
        'duplicate key value violates unique constraint "users_email_key"'
      )
    ) {
      res.status(400).json({
        error:
          "Email address already registered. Sign in or use a different email",
      });
    } else {
      res.status(500).json({ error: "Registration Failed" });
    }
    console.error(error);
  }
}

export { registerGoogleUser };
