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
exports.getAllCommentsHandler = void 0;
const db_1 = require("../db/db");
function getAllCommentsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { postId } = req.params;
        const getCommentsQuery = {
            text: `SELECT comments.*, users.username, users.profile_pic_id FROM "Freemind".comments JOIN "Freemind".users ON comments.userid = users.id WHERE comments.postid = $1 ORDER BY comments.commenttimestamp DESC`,
            values: [postId],
        };
        (0, db_1.queryDB)(getCommentsQuery, (err, result) => {
            if (err) {
                console.error("Error retrieving comments:", err);
                res.status(500).json({ error: "Error retrieving comments" });
                return;
            }
            if (result.rowCount === 0) {
                res.status(404).json({ error: "No comments found for this topic" });
                return;
            }
            else {
                const comments = result.rows;
                res.status(200).json(comments);
            }
        });
    });
}
exports.getAllCommentsHandler = getAllCommentsHandler;
//# sourceMappingURL=getAllComments.js.map