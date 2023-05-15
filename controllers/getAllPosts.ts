import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";

async function getAllPostsHandler(req: Request, res: Response): Promise<void> {
  const { topicId } = req.params;

  // Validate inputs here...
  //Please remember to add some validation for the inputs before
  //inserting them into the database to avoid SQL Injection attacks and
  //ensure the integrity of your data.

  const getPostsQuery = {
    text: `SELECT * FROM "Freemind".posts WHERE TopicID = $1`,
    values: [topicId],
  };

  queryDB(getPostsQuery, (err: Error, result: QueryResult) => {
    if (err) {
      console.error("Error retrieving posts:", err);
      res.status(500).json({ error: "Error retrieving posts" });
      return;
    }

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No posts found for this topic" });
      return;
    } else {
      const posts = result.rows;
      res.status(200).json(posts);
    }
  });
}

export { getAllPostsHandler };
