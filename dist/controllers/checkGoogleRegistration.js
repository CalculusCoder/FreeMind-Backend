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
exports.checkGoogleRegistration = void 0;
const db_1 = require("../db/db");
function checkGoogleRegistration(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the user email from the query parameters
            const email = req.query.email;
            // SQL statement to check if the user with the given email exists
            const QueryStatement = {
                text: `SELECT * FROM "Freemind".users WHERE email = $1`,
                values: [email],
            };
            // Query the database
            (0, db_1.queryDB)(QueryStatement, (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    res.status(500).send("Database error");
                    return;
                }
                if (result.rows.length > 0) {
                    // If the user exists, return a response indicating that the user is registered
                    res.json({ isRegistered: true });
                }
                else {
                    // If the user does not exist, return a response indicating that the user is not registered
                    res.json({ isRegistered: false });
                }
            });
        }
        catch (error) {
            console.error("Error occurred", error);
            res.status(500).send("Error occurred");
        }
    });
}
exports.checkGoogleRegistration = checkGoogleRegistration;
//# sourceMappingURL=checkGoogleRegistration.js.map