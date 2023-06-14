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
exports.deleteUserPost = void 0;
const pg_1 = require("pg");
const config_1 = require("../configuration/config");
// Assume you have a connection pool
const pool = new pg_1.Pool(config_1.db);
function deleteUserPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const { topicId, postId } = req.params;
            const { userId } = req.body;
            // Begin transaction
            yield client.query("BEGIN");
            const getPostQuery = {
                text: `SELECT * FROM "Freemind".posts WHERE TopicID = $1 AND PostID = $2`,
                values: [topicId, postId],
            };
            const postResult = yield client.query(getPostQuery);
            if (postResult.rowCount === 0) {
                console.error("Post could not be found");
                res.status(404).json({ error: "Post could not be found" });
                return;
            }
            else {
                const post = postResult.rows[0];
                if (post.userid !== userId && userId !== "21") {
                    res
                        .status(403)
                        .json({ error: "User not authorized to delete this post" });
                    return;
                }
                else {
                    // If the user is the post owner or an admin, delete the comments and the post
                    const deleteCommentsQuery = {
                        text: `DELETE FROM "Freemind".comments WHERE PostID = $1 RETURNING *`,
                        values: [postId],
                    };
                    yield client.query(deleteCommentsQuery);
                    const deletePostQuery = {
                        text: `DELETE FROM "Freemind".posts WHERE TopicID = $1 AND PostID = $2 RETURNING *`,
                        values: [topicId, postId],
                    };
                    const deletePostResult = yield client.query(deletePostQuery);
                    if (deletePostResult.rowCount === 0) {
                        console.error("Post could not be found or deleted");
                        res.status(404).json({ error: "Post could not be found or deleted" });
                        return;
                    }
                    else {
                        // Commit the transaction
                        yield client.query("COMMIT");
                        res
                            .status(200)
                            .json({ message: "Post and its comments successfully deleted" });
                    }
                }
            }
        }
        catch (err) {
            // If there was an error, rollback the transaction
            yield client.query("ROLLBACK");
            console.error("Error deleting post or comments:", err);
            res.status(500).json({ error: "Error deleting post or comments" });
        }
        finally {
            // Always release the client back to the pool after finishing the transaction
            client.release();
        }
    });
}
exports.deleteUserPost = deleteUserPost;
//# sourceMappingURL=deleteUserPost.js.map