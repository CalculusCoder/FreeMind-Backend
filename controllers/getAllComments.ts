import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";

async function getAllCommentsHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { postId } = req.params;

  const getCommentsQuery = {
    text: `SELECT * FROM "Freemind".comments WHERE PostID = $1`,
    values: [postId],
  };

  queryDB(getCommentsQuery, (err: Error, result: QueryResult) => {
    if (err) {
      console.error("Error retrieving comments:", err);
      res.status(500).json({ error: "Error retrieving comments" });
      return;
    }

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No comments found for this topic" });
      return;
    } else {
      const comments = result.rows;
      res.status(200).json(comments);
    }
  });
}

export { getAllCommentsHandler };
