import { Request, Response } from "express";
import { QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";

async function getAllPostsHandler(req: Request, res: Response): Promise<void> {
  const { topicId } = req.params;

  const page = parseInt(req.query.page as string) || 0;
  const pageSize = parseInt(req.query.pageSize as string) || 30;

  const getPostsQuery: QueryConfig = {
    text: `
      SELECT posts.*, users.username, users.profile_pic_id 
      FROM "Freemind".posts 
      JOIN "Freemind".users ON posts.UserId = users.id 
      WHERE posts.TopicID = $1 
      ORDER BY posts.posttimestamp DESC
      LIMIT $2 OFFSET $3`,
    values: [topicId, pageSize, page * pageSize],
  };

  try {
    const result: QueryResult = await queryDB(getPostsQuery);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No posts found for this topic" });
      return;
    } else {
      const posts = result.rows;
      res.status(200).json(posts);
    }
  } catch (err) {
    console.error("Error retrieving posts:", err);
    res.status(500).json({ error: "Error retrieving posts" });
  }
}

export { getAllPostsHandler };
