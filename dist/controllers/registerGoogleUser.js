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
exports.registerGoogleUser = void 0;
const db_1 = require("../db/db");
const Yup = __importStar(require("yup"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const userSchema = Yup.object().shape({
    email: Yup.string().required().email(),
    fullName: Yup.string().required(),
});
if (!process.env.SENDGRID_API_KEY || !process.env.GOOGLE_EMAIL) {
    throw new Error("SENDGRID_API_KEY or GOOGLE_EMAIL is not defined");
}
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
function registerGoogleUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, fullName } = req.body;
        try {
            yield userSchema.validate({
                email,
                fullName,
            });
            const QueryStatement = {
                text: `INSERT INTO "Freemind".users (Email, fullName) VALUES ($1::text, $2::text) RETURNING id, email, fullName, profile_pic_id`,
                values: [email, fullName],
            };
            const result = yield (0, db_1.queryDB)(QueryStatement);
            const user = result.rows[0];
            console.log(user);
            const msg = {
                to: "jaredgomez0812@gmail.com",
                from: process.env.GOOGLE_EMAIL,
                subject: "New Google User Registration",
                text: `A new user has registered with Google. Details: ${JSON.stringify(user)}`,
            };
            try {
                yield mail_1.default.send(msg);
                console.log("Email sent");
                res.status(200).json({ user, message: "User registered successfully" });
            }
            catch (error) {
                console.log(error);
            }
        }
        catch (error) {
            const errorMessage = error.message;
            if (errorMessage.includes('duplicate key value violates unique constraint "users_email_key"')) {
                res.status(400).json({
                    error: "Email address already registered. Sign in or use a different email",
                });
            }
            else {
                res.status(500).json({ error: "Registration Failed" });
            }
            console.error(error);
        }
    });
}
exports.registerGoogleUser = registerGoogleUser;
//# sourceMappingURL=registerGoogleUser.js.map