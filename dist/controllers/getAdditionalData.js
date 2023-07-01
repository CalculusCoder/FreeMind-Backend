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
exports.getAdditionalDataHandler = void 0;
const db_1 = require("../db/db");
function getAdditionalDataHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = req.query.email;
        console.log(email);
        if (!email) {
            res.status(400).json({ error: "Email not provided" });
            return;
        }
        const QueryStatement = {
            text: 'SELECT id, username, email, fullName, profile_pic_id, stripe_customer_id FROM "Freemind".users WHERE email = $1',
            values: [email],
        };
        try {
            const result = yield (0, db_1.queryDB)(QueryStatement);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                console.log(user);
                res.json(user);
            }
            else {
                console.log("User not found");
                res.status(404).json({ error: "User not found" });
            }
        }
        catch (err) {
            console.error("Database query error", err);
            res.status(500).json({ error: "Database query error" });
        }
    });
}
exports.getAdditionalDataHandler = getAdditionalDataHandler;
//# sourceMappingURL=getAdditionalData.js.map