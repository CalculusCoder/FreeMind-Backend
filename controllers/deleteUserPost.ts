import { Request, Response } from "express";
import { Pool } from "pg";
import { queryDB } from "../db/db";
import { db } from "../configuration/config";

// Assume you have a connection pool
const pool = new Pool(db);

async function deleteUserPost(req: Request, res: Response): Promise<void> {
  const client = await pool.connect();

  try {
    const { topicId, postId } = req.params;
    const { userId } = req.body;

    // Begin transaction
    await client.query("BEGIN");

    const getPostQuery = {
      text: `SELECT * FROM "Freemind".posts WHERE TopicID = $1 AND PostID = $2`,
      values: [topicId, postId],
    };

    const postResult = await client.query(getPostQuery);

    if (postResult.rowCount === 0) {
      console.error("Post could not be found");
      res.status(404).json({ error: "Post could not be found" });
      return;
    } else {
      const post = postResult.rows[0];

      if (post.userid !== userId && userId !== "158") {
        res
          .status(403)
          .json({ error: "User not authorized to delete this post" });
        return;
      } else {
        // If the user is the post owner or an admin, delete the comments and the post
        const deleteCommentsQuery = {
          text: `DELETE FROM "Freemind".comments WHERE PostID = $1 RETURNING *`,
          values: [postId],
        };

        await client.query(deleteCommentsQuery);

        const deletePostQuery = {
          text: `DELETE FROM "Freemind".posts WHERE TopicID = $1 AND PostID = $2 RETURNING *`,
          values: [topicId, postId],
        };

        const deletePostResult = await client.query(deletePostQuery);

        if (deletePostResult.rowCount === 0) {
          console.error("Post could not be found or deleted");
          res.status(404).json({ error: "Post could not be found or deleted" });
          return;
        } else {
          // Commit the transaction
          await client.query("COMMIT");
          res
            .status(200)
            .json({ message: "Post and its comments successfully deleted" });
        }
      }
    }
  } catch (err) {
    // If there was an error, rollback the transaction
    await client.query("ROLLBACK");
    console.error("Error deleting post or comments:", err);
    res.status(500).json({ error: "Error deleting post or comments" });
  } finally {
    // Always release the client back to the pool after finishing the transaction
    client.release();
  }
}

export { deleteUserPost };
