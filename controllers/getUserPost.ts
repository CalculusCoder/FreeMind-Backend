import { Request, Response } from "express";
import { QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";

async function getUserPost(req: Request, res: Response): Promise<void> {
  const { topicId, postId } = req.params;

  const getPostsQuery: QueryConfig = {
    text: `SELECT posts.*, users.username, users.profile_pic_id FROM "Freemind".posts JOIN "Freemind".users ON posts.userid = users.id WHERE posts.topicid = $1 AND posts.postid = $2`,
    values: [topicId, postId],
  };

  try {
    const result: QueryResult = await queryDB(getPostsQuery);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "No post found for this id" });
      return;
    } else {
      const post = result.rows[0];
      res.status(200).json(post);
    }
  } catch (err) {
    console.error("Error retrieving post:", err);
    res.status(500).json({ error: "Error retrieving post" });
  }
}

export { getUserPost };
