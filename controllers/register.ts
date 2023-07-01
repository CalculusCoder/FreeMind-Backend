import { Request, Response } from "express";
import { QueryConfig } from "pg";
import * as Yup from "yup";
import bcrypt from "bcrypt";
import sgMail from "@sendgrid/mail";
import { queryDB } from "../db/db";

const userSchema = Yup.object().shape({
  fullName: Yup.string().required(),
  forumUserName: Yup.string()
    .min(5, "Username must be at least 5 characters")
    .required("Username Required"),
  email: Yup.string().required().email(),
  password: Yup.string().required().min(7).matches(/[0-9]/).matches(/[A-Z]/),
});

if (!process.env.SENDGRID_API_KEY || !process.env.GOOGLE_EMAIL) {
  throw new Error("SENDGRID_API_KEY or GOOGLE_EMAIL is not defined");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function registerHandler(req: Request, res: Response): Promise<void> {
  const { fullName, forumUserName, email, password } = req.body;

  try {
    await userSchema.validate({
      fullName,
      forumUserName,
      email,
      password,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const QueryStatement: QueryConfig = {
      text: 'INSERT INTO "Freemind".users (Email, fullName, username, Password) VALUES ($1::text, $2::text, $3::text, $4::text)',
      values: [email, fullName, forumUserName, hashedPassword],
    };

    await queryDB(QueryStatement);
    console.log("User registered successfully");
    const msg = {
      to: "jaredgomez0812@gmail.com",
      from: process.env.GOOGLE_EMAIL as string,
      subject: "New User Registration",
      text: `A new user has registered. Details: ${JSON.stringify({
        fullName,
        email,
      })}`,
    };

    try {
      await sgMail.send(msg);
      console.log("Email sent");
    } catch (error) {
      console.error(error);
    }

    res.json({ message: "Registration successful" });
  } catch (error) {
    if (
      (error as Error).message.includes(
        'duplicate key value violates unique constraint "users_email_key"'
      )
    ) {
      res.status(400).json({
        error:
          "Email address already registered. Sign in or use a different email",
      });
    } else if (
      (error as Error).message.includes(
        'duplicate key value violates unique constraint "users_UserName_key"'
      )
    ) {
      res.status(401).json({
        error: "Username already exists. Please use a different username",
      });
    } else if ((error as Yup.ValidationError).errors) {
      console.error("Validation error", error);
      res.status(400).json({ error: "Validation error" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Registration Failed" });
    }
  }
}

export { registerHandler };
