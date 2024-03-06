import { Request, Response } from "express";
import { queryDB } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import sgMail from "@sendgrid/mail";

async function resetPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  const checkForUser = {
    text: 'SELECT email, password FROM "Freemind".users WHERE email=$1',
    values: [email],
  };

  try {
    const result = await queryDB(checkForUser);

    if (result.rows.length > 0) {
      if (result.rows[0].password === null) {
        res.status(401).json({
          error:
            "User used Google authentication to register. Please sign in with Google.",
        });
        return;
      }

      const resetToken = uuidv4();
      const now = new Date();
      const tokenExpiry = new Date(now.getTime() + 15 * 60 * 1000); // Token valid for 15 minutes

      const storeTokenQuery = {
        text: `UPDATE "Freemind".users SET reset_token=$1, token_expiry=$2 WHERE email=$3`,
        values: [resetToken, tokenExpiry, email],
      };

      await queryDB(storeTokenQuery);

      if (!process.env.GOOGLE_EMAIL) {
        throw new Error("EMAIL_USERNAME is not defined");
      }

      if (!process.env.SENDGRID_API_KEY) {
        throw new Error("SENDGRID_API_KEY is not defined");
      }
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email,
        from: process.env.GOOGLE_EMAIL,
        subject: "Password Reset Request",
        text: `You have requested to reset your password. Please click on the following link, or paste it into your browser to complete the process within the next 15 minutes: 
    https://www.freemindrecovery.com/Home/ResetPassword?token=${resetToken}`,
      };

      try {
        await sgMail.send(msg);
        console.log("Email sent");
        res.status(200).json({
          message:
            "You will receive a password recovery link to your email shortly",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      res.status(400).json({ error: "Email does not exist." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", message: err });
  }
}

export { resetPassword };
