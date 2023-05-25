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
exports.getAllPostsHandler = void 0;
const db_1 = require("../db/db");
function getAllPostsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { topicId } = req.params;
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 30;
        const getPostsQuery = {
            text: `
      SELECT posts.*, users.username, users.profile_pic_id 
      FROM "Freemind".posts 
      JOIN "Freemind".users ON posts.UserId = users.id 
      WHERE posts.TopicID = $1 
      ORDER BY posts.posttimestamp DESC
      LIMIT $2 OFFSET $3`,
            values: [topicId, pageSize, page * pageSize],
        };
        (0, db_1.queryDB)(getPostsQuery, (err, result) => {
            if (err) {
                console.error("Error retrieving posts:", err);
                res.status(500).json({ error: "Error retrieving posts" });
                return;
            }
            if (result.rowCount === 0) {
                res.status(404).json({ error: "No posts found for this topic" });
                return;
            }
            else {
                const posts = result.rows;
                res.status(200).json(posts);
            }
        });
    });
}
exports.getAllPostsHandler = getAllPostsHandler;
//# sourceMappingURL=getAllPosts.js.map