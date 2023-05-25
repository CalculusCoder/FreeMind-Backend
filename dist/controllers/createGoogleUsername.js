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
exports.createGoogleUsername = void 0;
const db_1 = require("../db/db");
const Yup = __importStar(require("yup"));
const userSchema = Yup.object().shape({
    forumUserName: Yup.string()
        .min(5, "Username must be at least 5 characters")
        .required("Username Required"),
});
function createGoogleUsername(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, forumUserName } = req.body;
        console.log(email, forumUserName);
        try {
            yield userSchema.validate({
                forumUserName,
            });
            // Update query to include the forumUserName
            const QueryStatement = {
                text: `UPDATE "Freemind".users SET username = $2 WHERE email = $1`,
                values: [email, forumUserName],
            };
            (0, db_1.queryDB)(QueryStatement, (err, result) => {
                if (err) {
                    console.error(err);
                    if (err.message.includes('duplicate key value violates unique constraint "users_ForumUserName_key"')) {
                        // Return a specific error message if the username already exists
                        return res.status(400).json({
                            error: "Username already exists. Please choose a different one.",
                        });
                    }
                    else {
                        return res.status(500).json({ error: "Update Failed" });
                    }
                }
                res.status(200).json({ message: "Username updated successfully" });
            });
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ error: error });
        }
    });
}
exports.createGoogleUsername = createGoogleUsername;
//# sourceMappingURL=createGoogleUsername.js.map