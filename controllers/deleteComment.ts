import { Request, Response } from "express";
import { QueryResult } from "pg";
import { queryDB } from "../db/db";

async function deleteCommentHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  const getCommentQuery = {
    text: `SELECT * FROM "Freemind".comments WHERE CommentID = $1 AND PostID = $2`,
    values: [commentId, postId],
  };

  queryDB(getCommentQuery, (err: Error, result: QueryResult) => {
    if (err) {
      console.error("Error retrieving comment:", err);
      res.status(500).json({ error: "Error retrieving comment" });
      return;
    }

    if (result.rowCount === 0) {
      console.error("Comment could not be found");
      res.status(404).json({ error: "Comment could not be found" });
      return;
    } else {
      const comment = result.rows[0];
      if (comment.userid !== userId && userId !== "21") {
        res
          .status(403)
          .json({ error: "User not authorized to delete this comment" });
        return;
      } else {
        // If the user is the comment owner or admin, delete the comment
        const deleteCommentQuery = {
          text: `DELETE FROM "Freemind".comments WHERE CommentID = $1`,
          values: [commentId],
        };

        queryDB(deleteCommentQuery, (err: Error, result: QueryResult) => {
          if (err) {
            console.error("Error deleting comment:", err);
            res.status(500).json({ error: "Error deleting comment" });
            return;
          }

          if (result.rowCount === 0) {
            console.error("Comment could not be found or deleted");
            res
              .status(404)
              .json({ error: "Comment could not be found or deleted" });
            return;
          } else {
            res.status(200).json({ message: "Comment successfully deleted" });
          }
        });
      }
    }
  });
}

export { deleteCommentHandler };
