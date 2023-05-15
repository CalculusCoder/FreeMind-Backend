import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";

async function deleteUserPost(req: Request, res: Response): Promise<void> {
  const { topicId, postId } = req.params;
  const { userId } = req.body;

  const getPostQuery = {
    text: `SELECT * FROM "Freemind".posts WHERE TopicID = $1 AND PostID = $2`,
    values: [topicId, postId],
  };

  queryDB(getPostQuery, (err: Error, result: QueryResult) => {
    if (err) {
      console.error("Error retrieving post:", err);
      res.status(500).json({ error: "Error retrieving post" });
      return;
    }

    if (result.rowCount === 0) {
      console.error("Post could not be found");
      res.status(404).json({ error: "Post could not be found" });
      return;
    } else {
      const post = result.rows[0];

      if (post.userid !== userId && userId !== "158") {
        res
          .status(403)
          .json({ error: "User not authorized to delete this post" });
        return;
      } else {
        // If the user is the post owner or an admin, delete the post
        const deletePostQuery = {
          text: `DELETE FROM "Freemind".posts WHERE TopicID = $1 AND PostID = $2 RETURNING *`,
          values: [topicId, postId],
        };

        queryDB(deletePostQuery, (err: Error, result: QueryResult) => {
          if (err) {
            console.error("Error deleting post:", err);
            res.status(500).json({ error: "Error deleting post" });
            return;
          }

          if (result.rowCount === 0) {
            console.error("Post could not be found or deleted");
            res
              .status(404)
              .json({ error: "Post could not be found or deleted" });
            return;
          } else {
            res.status(200).json({ message: "Post successfully deleted" });
          }
        });
      }
    }
  });
}

export { deleteUserPost };
