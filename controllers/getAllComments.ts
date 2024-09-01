import { Request, Response } from "express";
import { QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";

async function getAllCommentsHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { postId } = req.params;

  const getCommentsQuery: QueryConfig = {
    text: `SELECT comments.*, users.username, users.profile_pic_id FROM "Freemind".comments JOIN "Freemind".users ON comments.userid = users.id WHERE comments.postid = $1 ORDER BY comments.commenttimestamp DESC`,
    values: [postId],
  };

  try {
    const result: QueryResult = await queryDB(getCommentsQuery);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No comments found for this post" });
    } else {
      const comments = result.rows;
      res.status(200).json(comments);
    }
  } catch (err) {
    console.error("Error retrieving comments:", err);
    res.status(500).json({ error: "Error retrieving comments" });
  }
}

export { getAllCommentsHandler };
