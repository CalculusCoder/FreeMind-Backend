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
exports.checkMembership = void 0;
const db_1 = require("../db/db");
function checkMembership(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
        const checkMembershipQuery = {
            text: 'SELECT access_expiration FROM "Freemind".users WHERE email=$1',
            values: [email],
        };
        (0, db_1.queryDB)(checkMembershipQuery, (err, result) => {
            if (err) {
                console.error("Error checking user membership:", err);
                res.status(500).json({ error: "Error checking user membership" });
                return;
            }
            if (result.rowCount === 0) {
                console.error("No user found with the given email");
                res.status(404).json({ error: "No user found with the given email" });
                return;
            }
            else {
                const access_expiration = result.rows[0].access_expiration;
                res.status(200).json({ access_expiration });
            }
        });
    });
}
exports.checkMembership = checkMembership;
//# sourceMappingURL=check-membership.js.map