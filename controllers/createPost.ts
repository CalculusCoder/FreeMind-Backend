import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";
import * as yup from "yup";

async function createPostHandler(req: Request, res: Response): Promise<void> {
  const { topicId } = req.params;
  const { userId, postTitle, postContent } = req.body;

  // Validate inputs here...
  //Please remember to add some validation for the inputs before
  //inserting them into the database to avoid SQL Injection attacks and
  //ensure the integrity of your data.

  const schema = yup.object().shape({
    userId: yup.string().required(),
    postTitle: yup.string().min(5).required(),
    postContent: yup.string().min(10).required(),
  });

  try {
    await schema.validate({ userId, postTitle, postContent });

    const createPostQuery = {
      text: `INSERT INTO "Freemind".posts(UserID, TopicID, PostTitle, PostContent) VALUES($1, $2, $3, $4) RETURNING *`,
      values: [userId, topicId, postTitle, postContent],
    };

    queryDB(createPostQuery, (err: Error, result: QueryResult) => {
      if (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: "Error creating post" });
        return;
      }

      if (result.rowCount === 0) {
        console.error("Post could not be created");
        res.status(500).json({ error: "Post could not be created" });
        return;
      } else {
        const post = result.rows[0];
        res.status(200).json(post);
      }
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
}

export { createPostHandler };
