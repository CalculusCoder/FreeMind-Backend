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
exports.getUserPost = void 0;
const db_1 = require("../db/db");
function getUserPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { topicId, postId } = req.params;
        const getPostsQuery = {
            text: `SELECT posts.*, users.username, users.profile_pic_id FROM "Freemind".posts JOIN "Freemind".users ON posts.userid = users.id WHERE posts.topicid = $1 AND posts.postid = $2`,
            values: [topicId, postId],
        };
        try {
            const result = yield (0, db_1.queryDB)(getPostsQuery);
            if (result.rowCount === 0) {
                res.status(404).json({ error: "No post found for this id" });
                return;
            }
            else {
                const post = result.rows[0];
                res.status(200).json(post);
            }
        }
        catch (err) {
            console.error("Error retrieving post:", err);
            res.status(500).json({ error: "Error retrieving post" });
        }
    });
}
exports.getUserPost = getUserPost;
//# sourceMappingURL=getUserPost.js.map