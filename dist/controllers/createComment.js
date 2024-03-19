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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentHandler = void 0;
const db_1 = require("../db/db");
const yup = __importStar(require("yup"));
const nodemailer_1 = __importDefault(require("nodemailer"));
function createCommentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { postId } = req.params;
        const { userId, commentContent } = req.body;
        const schema = yup.object().shape({
            userId: yup.string().required(),
            commentContent: yup.string().min(2).required(),
        });
        try {
            yield schema.validate({ userId, commentContent });
            const createCommentQuery = {
                text: `INSERT INTO "Freemind".comments(UserID, PostID, CommentContent) VALUES($1, $2, $3) RETURNING *`,
                values: [userId, postId, commentContent],
            };
            const result = yield (0, db_1.queryDB)(createCommentQuery);
            if (result.rowCount === 0) {
                console.error("Comment could not be created");
                res.status(500).json({ error: "Comment could not be created" });
            }
            else {
                console.log(result.rows[0]);
                const comment = result.rows[0];
                res.status(200).json(comment);
            }
            sendReplyEmail(postId);
        }
        catch (error) {
            console.error("Error creating comment:", error);
            res.status(400).json({ error: error });
        }
    });
}
exports.createCommentHandler = createCommentHandler;
//export this function to a utils folder to clean it up
function sendReplyEmail(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const getUserIdQuery = {
                text: `SELECT p.UserID, u.Email 
      FROM "Freemind".posts p
      JOIN "Freemind".users u ON p.UserID = u.ID 
      WHERE p.PostID = $1`,
                values: [postId],
            };
            const result = yield (0, db_1.queryDB)(getUserIdQuery);
            if (result.rowCount === 0) {
                throw new Error("No user found for the given postId");
            }
            else {
                const { email } = result.rows[0];
                try {
                    let transporter = nodemailer_1.default.createTransport({
                        service: "gmail",
                        auth: {
                            type: "OAuth2",
                            user: "freemindcontact1@gmail.com",
                            clientId: process.env.GOOGLE_NODEMAILER_CLIENT_ID,
                            clientSecret: process.env.GOOGLE_NODEMAILER_SECRET,
                            refreshToken: process.env.GOOGLE_NODEMAILER_REFRESH_TOKEN,
                        },
                    });
                    let mailOptions = {
                        from: "freemindcontact1@gmail.com",
                        to: email,
                        subject: "FreeMind Forums: You received a reply!",
                        text: `Your post received a reply! Check it out at FreeMind Recovery Forums!`,
                    };
                    yield transporter.sendMail(mailOptions);
                }
                catch (error) {
                    throw new Error("Error sending user email");
                }
            }
        }
        catch (error) {
            console.log(error);
            throw new Error("Error returning user post id and email");
        }
    });
}
//# sourceMappingURL=createComment.js.map