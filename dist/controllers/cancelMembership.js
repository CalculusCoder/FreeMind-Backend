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
exports.cancelSubscription = void 0;
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
function cancelSubscription(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userEmail } = req.body;
        if (!userEmail) {
            return res.sendStatus(400);
        }
        try {
            // Retrieve the customer by email
            const customers = yield stripe.customers.list({ email: userEmail });
            if (customers.data.length === 0) {
                return res.status(403).json({ message: "Customer not found" });
            }
            const customerId = customers.data[0].id;
            // Retrieve the customer's subscriptions
            const subscriptions = yield stripe.subscriptions.list({
                customer: customerId,
            });
            if (subscriptions.data.length === 0) {
                return res.status(404).json({ message: "Subscription not found" });
            }
            const subscription = subscriptions.data[0];
            // Check if the subscription is already canceled
            if (subscription.status === "canceled") {
                console.log("Subscription already cancelled");
                return res
                    .status(401)
                    .json({ message: "Subscription is already canceled" });
            }
            // Cancel the subscription
            yield stripe.subscriptions.del(subscription.id);
            console.log("Subscription  cancelled !!!");
            return res
                .status(200)
                .json({ message: "Subscription canceled successfully" });
        }
        catch (error) {
            console.error("Error:", error);
            return res
                .status(500)
                .json({ message: "Failed to cancel the subscription" });
        }
    });
}
exports.cancelSubscription = cancelSubscription;
//# sourceMappingURL=cancelMembership.js.map