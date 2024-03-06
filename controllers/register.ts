import { Request, Response } from "express";
import { QueryConfig } from "pg";
import * as Yup from "yup";
import bcrypt from "bcrypt";
import sgMail from "@sendgrid/mail";
import { queryDB } from "../db/db";
import { v4 as uuidv4 } from "uuid";

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

    const verificationToken = uuidv4();

    const QueryStatement: QueryConfig = {
      text: 'INSERT INTO "Freemind".users (Email, fullName, username, Password, verification_token) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text) RETURNING id',
      values: [
        email,
        fullName,
        forumUserName,
        hashedPassword,
        verificationToken,
      ],
    };

    const result = await queryDB(QueryStatement);
    const userId = result.rows[0].id;

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

      // https://www.freemindrecovery.com
      //switch to http://localhost:3000 when testing
      //change to freemind url when finished
      const verificationUrl = `https://www.freemindrecovery.com/Home/VerifyEmail/?token=${verificationToken}&id=${userId}`;
      const verificationMsg = {
        to: email,
        from: "freemindcontact1@gmail.com",
        subject: "Verify Your Email",
        text: `Please verify your email by clicking on the link: ${verificationUrl}`,
      };

      await sgMail.send(verificationMsg);
      console.log("Emails sent");
    } catch (error) {
      console.error(error);
    }

    // const verificationUrl = `https://yourwebsite.com/verify?token=${verificationToken}`;
    // const verificationMsg = {
    //   to: email, // Send to the user's email
    //   from: process.env.GOOGLE_EMAIL as string,
    //   subject: "Verify Your Email",
    //   text: `Please verify your email by clicking on the link: ${verificationUrl}`,
    // };

    // await sgMail.send(verificationMsg);

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
