import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";
const bcrypt = require("bcrypt");
import nodemailer from "nodemailer";

async function checkTokenResetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token, newPassword } = req.body;

  const checkForUser = {
    text: 'SELECT email, token_expiry FROM "Freemind".users WHERE reset_token=$1',
    values: [token],
  };

  try {
    const result = await queryDB(checkForUser);

    if (result.rows.length > 0) {
      const tokenExpiry = result.rows[0].token_expiry;

      if (new Date() > tokenExpiry) {
        res.status(401).json({ error: "Reset token has expired." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePasswordQuery = {
        text: `UPDATE "Freemind".users SET password=$1, reset_token=NULL, token_expiry=NULL WHERE reset_token=$2`,
        values: [hashedPassword, token],
      };

      await queryDB(updatePasswordQuery);

      try {
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "freemindcontact1@gmail.com",
            //can add password here
            clientId: process.env.GOOGLE_NODEMAILER_CLIENT_ID,
            clientSecret: process.env.GOOGLE_NODEMAILER_SECRET,
            refreshToken: process.env.GOOGLE_NODEMAILER_REFRESH_TOKEN,
          },
        });

        let mailOptions = {
          from: "freemindcontact1@gmail.com",
          to: result.rows[0].email,
          subject: "Password Reset Successful!",
          text: `Your password has been successfully reset.`,
        };

        await transporter.sendMail(mailOptions);
      } catch (error) {
        res.status(500).json({ error: "Error sending success emails" });
        return;
      }

      res.status(200).json({ message: "Password reset successful." });
    } else {
      res.status(400).json({ error: "Invalid or expired token." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error, Please try again or contact support",
    });
  }
}

export { checkTokenResetPassword };
