"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommentHandler = void 0;
const db_1 = require("../db/db");
function deleteCommentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { postId, commentId } = req.params;
        const { userId } = req.body;
        const getCommentQuery = {
            text: `SELECT * FROM "Freemind".comments WHERE CommentID = $1 AND PostID = $2`,
            values: [commentId, postId],
        };
        try {
            const result = yield (0, db_1.queryDB)(getCommentQuery);
            if (result.rowCount === 0) {
                console.error("Comment could not be found");
                res.status(404).json({ error: "Comment could not be found" });
                return;
            }
            else {
                const comment = result.rows[0];
                if (comment.userid !== userId && userId !== "21") {
                    res
                        .status(403)
                        .json({ error: "User not authorized to delete this comment" });
                    return;
                }
                else {
                    // If the user is the comment owner or admin, delete the comment
                    const deleteCommentQuery = {
                        text: `DELETE FROM "Freemind".comments WHERE CommentID = $1`,
                        values: [commentId],
                    };
                    const deleteResult = yield (0, db_1.queryDB)(deleteCommentQuery);
                    if (deleteResult.rowCount === 0) {
                        console.error("Comment could not be found or deleted");
                        res
                            .status(404)
                            .json({ error: "Comment could not be found or deleted" });
                        return;
                    }
                    else {
                        res.status(200).json({ message: "Comment successfully deleted" });
                    }
                }
            }
        }
        catch (err) {
            console.error("Error retrieving or deleting comment:", err);
            res.status(500).json({ error: "Error retrieving or deleting comment" });
        }
    });
}
exports.deleteCommentHandler = deleteCommentHandler;
//# sourceMappingURL=deleteComment.js.map