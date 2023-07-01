import { Request, Response } from "express";
import { queryDB } from "../db/db";
import * as yup from "yup";

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
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({ error: error });
  }
}

export { createCommentHandler };
