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
exports.loginHandler = void 0;
const db_1 = require("../db/db");
const bcrypt = require("bcrypt");
function loginHandler(req, res) {
    const { email, password } = req.body;
    try {
        const QueryStatement = {
            text: 'SELECT * FROM "Freemind".users WHERE email = $1',
            values: [email],
        };
        (0, db_1.queryDB)(QueryStatement, (err, result) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (err) {
                    console.error("Database query error", err);
                    res.status(500).json({ error: "Database query error" });
                }
                if (result.rows.length > 0) {
                    const user = result.rows[0];
                    if (user.password === null) {
                        return res.status(402).json({
                            error: "User used Google authentication to register. Please sign in with Google.",
                        });
                    }
                    const isMatch = yield bcrypt.compare(password, user.password);
                    if (isMatch) {
                        res.json({
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            profile_pic_id: user.profile_pic_id,
                            stripe_customer_id: user.stripe_customer_id,
                        });
                    }
                    else {
                        console.log("Invalid Email or Password");
                        res.status(401).json({ error: "Invalid Email or Password" });
                    }
                }
                else {
                    console.log("Invalid Email or Password");
                    res.status(404).json({ error: "Invalid Email or Password" });
                }
            }
            catch (innerError) {
                console.error("Error occurred inside callback", innerError);
                return res.status(500).send("Error occurred");
            }
        }));
    }
    catch (error) {
        console.error("Error occurred", error);
        res.status(500).send("Error occurred");
    }
}
exports.loginHandler = loginHandler;
//# sourceMappingURL=signin.js.map