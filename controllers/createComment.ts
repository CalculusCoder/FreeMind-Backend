import { Request, Response } from "express";
import { queryDB } from "../db/db";
import * as yup from "yup";
import nodemailer from "nodemailer";

async function createCommentHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { postId } = req.params;
  const { userId, commentContent } = req.body;

  const schema = yup.object().shape({
    userId: yup.string().required(),
    commentContent: yup.string().min(2).required(),
  });

  try {
    await schema.validate({ userId, commentContent });

    const createCommentQuery = {
      text: `INSERT INTO "Freemind".comments(UserID, PostID, CommentContent) VALUES($1, $2, $3) RETURNING *`,
      values: [userId, postId, commentContent],
    };

    const result = await queryDB(createCommentQuery);

    if (result.rowCount === 0) {
      console.error("Comment could not be created");
      res.status(500).json({ error: "Comment could not be created" });
    } else {
      const comment = result.rows[0];
      res.status(200).json(comment);
    }

    sendReplyEmail(postId, userId);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({ error: error });
  }
}

export { createCommentHandler };

//export this function to a utils folder to clean it up
async function sendReplyEmail(postId: String, userId: String) {
  try {
    const getUserIdQuery = {
      text: `SELECT p.UserID, u.Email 
      FROM "Freemind".posts p
      JOIN "Freemind".users u ON p.UserID = u.ID 
      WHERE p.PostID = $1`,
      values: [postId],
    };

    const result = await queryDB(getUserIdQuery);

    if (result.rowCount === 0) {
      throw new Error("No user found for the given postId");
    } else {
      const { email, userid: commenterUserid } = result.rows[0];

      try {
        if (commenterUserid !== userId) {
          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              type: "OAuth2",
              user: "freemindcontact1@gmail.com",
              clientId: process.env.GOOGLE_NODEMAILER_CLIENT_ID,
              clientSecret: process.env.GOOGLE_NODEMAILER_SECRET,
              refreshToken: process.env.GOOGLE_NODEMAILER_REFRESH_TOKEN,
            },
          });

          let mailOptions = {
            from: "freemindcontact1@gmail.com",
            to: email,
            subject: "FreeMind Forums: You received a reply!",
            text: `Your post received a reply! Check it out at FreeMind Recovery Forums!`,
          };

          await transporter.sendMail(mailOptions);
        }
      } catch (error) {
        throw new Error("Error sending user email");
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error returning user post id and email");
  }
}
