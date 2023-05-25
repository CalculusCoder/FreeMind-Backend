"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalDataHandler = void 0;
const db_1 = require("../db/db");
function getAdditionalDataHandler(req, res) {
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
    (0, db_1.queryDB)(QueryStatement, (err, result) => {
        if (err) {
            console.error("Database query error", err);
            res.status(500).json({ error: "Database query error" });
        }
        else {
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
    });
}
exports.getAdditionalDataHandler = getAdditionalDataHandler;
//# sourceMappingURL=getAdditionalData.js.map