import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";
import * as yup from "yup";

async function createCommentHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { postId } = req.params;
  const { userId, commentContent } = req.body;

  // Validate inputs here...
  //Please remember to add some validation for the inputs before
  //inserting them into the database to avoid SQL Injection attacks and
  //ensure the integrity of your data.

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

    queryDB(createCommentQuery, (err: Error, result: QueryResult) => {
      if (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ error: "Error creating comment" });
        return;
      }

      if (result.rowCount === 0) {
        console.error("Comment could not be created");
        res.status(500).json({ error: "Comment could not be created" });
        return;
      } else {
        const comment = result.rows[0];
        res.status(200).json(comment);
      }
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
}

export { createCommentHandler };
