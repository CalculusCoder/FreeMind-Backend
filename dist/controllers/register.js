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
exports.registerHandler = void 0;
const db_1 = require("../db/db");
const Yup = __importStar(require("yup"));
const bcrypt = require("bcrypt");
const userSchema = Yup.object().shape({
    fullName: Yup.string().required(),
    forumUserName: Yup.string()
        .min(5, "Username must be at least 5 characters")
        .required("Username Required"),
    email: Yup.string().required().email(),
    password: Yup.string().required().min(7).matches(/[0-9]/).matches(/[A-Z]/),
});
function registerHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fullName, forumUserName, email, password } = req.body;
        try {
            yield userSchema.validate({
                fullName,
                forumUserName,
                email,
                password,
            });
            const hashedPassword = yield bcrypt.hash(password, 10);
            const QueryStatement = {
                text: 'INSERT INTO "Freemind".users (Email, fullName, username, Password) VALUES ($1::text, $2::text, $3::text, $4::text)',
                values: [email, fullName, forumUserName, hashedPassword],
            };
            (0, db_1.queryDB)(QueryStatement, (err, result) => {
                if (err) {
                    console.error(err);
                    if (err.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
                        return res.status(400).json({
                            error: "Email address already registered. Sign in or use a different email",
                        });
                    }
                    else if (err.message.includes('duplicate key value violates unique constraint "users_UserName_key"')) {
                        return res.status(401).json({
                            error: "Username already exists. Please use a different username",
                        });
                    }
                    else {
                        return res.status(500).json({ error: "Registration Failed" });
                    }
                }
                else {
                    console.log("User registered successfully");
                    res.json({ message: "Registration successful" });
                }
            });
        }
        catch (error) {
            console.error("Validation error", error);
            res.status(400).json({ error: "Validation error" });
        }
    });
}
exports.registerHandler = registerHandler;
//# sourceMappingURL=register.js.map