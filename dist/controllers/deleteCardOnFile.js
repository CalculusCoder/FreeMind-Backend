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
exports.deleteCardOnFile = void 0;
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
function deleteCardOnFile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { cardId } = req.body;
            yield stripe.paymentMethods.detach(cardId);
            return res.status(200).json({ message: "Card deleted successfully" });
        }
        catch (error) {
            console.error(error);
            return res.status(500).send("Failed to delete card");
        }
    });
}
exports.deleteCardOnFile = deleteCardOnFile;
//# sourceMappingURL=deleteCardOnFile.js.map