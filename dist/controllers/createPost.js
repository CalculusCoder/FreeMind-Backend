"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createPostHandler = void 0;
const db_1 = require("../db/db");
const yup = __importStar(require("yup"));
function createPostHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { topicId } = req.params;
        const { userId, postTitle, postContent } = req.body;
        // Validate inputs here...
        //Please remember to add some validation for the inputs before
        //inserting them into the database to avoid SQL Injection attacks and
        //ensure the integrity of your data.
        const schema = yup.object().shape({
            userId: yup.string().required(),
            postTitle: yup.string().min(5).required(),
            postContent: yup.string().min(10).required(),
        });
        try {
            yield schema.validate({ userId, postTitle, postContent });
            const createPostQuery = {
                text: `INSERT INTO "Freemind".posts(UserID, TopicID, PostTitle, PostContent) VALUES($1, $2, $3, $4) RETURNING *`,
                values: [userId, topicId, postTitle, postContent],
            };
            (0, db_1.queryDB)(createPostQuery, (err, result) => {
                if (err) {
                    console.error("Error creating post:", err);
                    res.status(500).json({ error: "Error creating post" });
                    return;
                }
                if (result.rowCount === 0) {
                    console.error("Post could not be created");
                    res.status(500).json({ error: "Post could not be created" });
                    return;
                }
                else {
                    const post = result.rows[0];
                    res.status(200).json(post);
                }
            });
        }
        catch (error) {
            res.status(400).json({ error: error });
        }
    });
}
exports.createPostHandler = createPostHandler;
//# sourceMappingURL=createPost.js.map