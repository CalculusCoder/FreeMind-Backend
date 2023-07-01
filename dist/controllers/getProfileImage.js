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
exports.getProfileImage = void 0;
const db_1 = require("../db/db");
const yup = __importStar(require("yup"));
function getProfileImage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        // Validate userId
        const schema = yup.string().required();
        try {
            yield schema.validate(userId);
        }
        catch (err) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }
        const getImage = {
            text: `SELECT profile_pic_id FROM "Freemind".users WHERE id = $1`,
            values: [userId],
        };
        try {
            const result = yield (0, db_1.queryDB)(getImage);
            if (result.rowCount === 0) {
                res.status(404).json({ error: "No image found for this user id" });
                return;
            }
            else {
                res.status(200).json({ profile_pic_id: result.rows[0].profile_pic_id });
            }
        }
        catch (err) {
            console.error("Error getting profile image:", err);
            res.status(500).json({ error: "Error getting profile image" });
        }
    });
}
exports.getProfileImage = getProfileImage;
//# sourceMappingURL=getProfileImage.js.map