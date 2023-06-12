import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

function queryDBPromise(query: any): Promise<QueryResult> {
  return new Promise((resolve, reject) => {
    queryDB(query, (err: Error, result: QueryResult) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function resetPassword(req: Request, res: Response): Promise<Response> {
  const { email } = req.body;

  const checkForUser = {
    text: 'SELECT email, password FROM "Freemind".users WHERE email=$1',
    values: [email],
  };

  try {
    const result: QueryResult = await queryDBPromise(checkForUser);
    
    if (result.rows.length > 0) {
      if (result.rows[0].password === null) {
        return res.status(401).json({
          error:
            "User used Google authentication to register. Please sign in with Google.",
        });
      }

      const resetToken = uuidv4();
      const now = new Date();
      const tokenExpiry = new Date(now.getTime() + 15 * 60 * 1000); // Token valid for 15 minutes

      const storeTokenQuery = {
        text: `UPDATE "Freemind".users SET reset_token=$1, token_expiry=$2 WHERE email=$3`,
        values: [resetToken, tokenExpiry, email],
      };

      try {
        await queryDBPromise(storeTokenQuery);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Send email with reset link
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.GOOGLE_EMAIL,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: "Your-Access-Token",
        },
      });

      let mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: email,
        subject: "Password Reset Request",
        text: `You have requested to reset your password. Please click on the following link, or paste it into your browser to complete the process within the next 15 minutes: 
        https://freemindrecovery.com/Home/ResetPassword?token=${resetToken}`,
      };

      let info = await transporter.sendMail(mailOptions);

      return res.status(200).json({
        message:
          "You will receive a password recovery link to your email shortly",
      });

    } else {
      return res.status(400).json({ error: "Email does not exist." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export { resetPassword };
