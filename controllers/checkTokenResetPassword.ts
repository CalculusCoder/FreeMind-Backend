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

  queryDB(checkForUser, async (err: Error, result: QueryResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error, Please try again or contact support",
      });
    }

    if (result.rows.length > 0) {
      const tokenExpiry = result.rows[0].token_expiry;

      if (new Date() > tokenExpiry) {
        return res.status(401).json({ error: "Reset token has expired." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePasswordQuery = {
        text: `UPDATE "Freemind".users SET password=$1, reset_token=NULL, token_expiry=NULL WHERE reset_token=$2`,
        values: [hashedPassword, token],
      };

      queryDB(updatePasswordQuery, async (err: Error) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            error: "Internal Server Error, Please try again or contact support",
          });
        }

        // Send confirmation email
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.GOOGLE_EMAIL,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          },
        });

        let mailOptions = {
          from: process.env.GOOGLE_EMAIL,
          to: result.rows[0].email,
          subject: "Password Reset Successful",
          text: `Your password has been successfully reset.`,
        };

        let info = await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset successful." });
      });
    } else {
      res.status(400).json({ error: "Invalid or expired token." });
    }
  });
}

export { checkTokenResetPassword };
