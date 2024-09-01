import { Request, Response } from "express";
import { QueryResult, QueryConfig } from "pg";
import { queryDB } from "../db/db";

async function deleteCommentHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  const getCommentQuery: QueryConfig = {
    text: `SELECT * FROM "Freemind".comments WHERE CommentID = $1 AND PostID = $2`,
    values: [commentId, postId],
  };

  try {
    const result: QueryResult = await queryDB(getCommentQuery);

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
        const deleteCommentQuery: QueryConfig = {
          text: `DELETE FROM "Freemind".comments WHERE CommentID = $1`,
          values: [commentId],
        };

        const deleteResult: QueryResult = await queryDB(deleteCommentQuery);

        if (deleteResult.rowCount === 0) {
          console.error("Comment could not be found or deleted");
          res
            .status(404)
            .json({ error: "Comment could not be found or deleted" });
          return;
        } else {
          res.status(200).json({ message: "Comment successfully deleted" });
        }
      }
    }
  } catch (err) {
    console.error("Error retrieving or deleting comment:", err);
    res.status(500).json({ error: "Error retrieving or deleting comment" });
  }
}

export { deleteCommentHandler };
