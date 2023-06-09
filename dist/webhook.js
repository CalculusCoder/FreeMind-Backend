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
exports.webhookHandler = void 0;
const db_1 = require("./db/db");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
function webhookHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const stripeSignature = req.headers["stripe-signature"];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, stripeSignature, process.env.STRIPE_WEBHOOK_SIGNATURE);
        }
        catch (err) {
            console.log(`Error: ${err}`);
            return res.status(400).send(`Webhook error: ${err}`);
        }
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            console.log("PaymentIntent was successful:", paymentIntent.id);
        }
        else if (event.type === "customer.subscription.created") {
            const subscription = event.data.object;
            console.log("Subscription created:", subscription.id);
            const customerId = subscription.customer;
            const customer = yield stripe.customers.retrieve(customerId);
            const userEmail = customer.email;
            const newExpirationDate = new Date(subscription.current_period_end * 1000);
            newExpirationDate.setHours(newExpirationDate.getHours() + 1);
            const updateMembershipStatusQuery = {
                text: 'UPDATE "Freemind".users stripe_customer_id=$2, access_expiration=$3 WHERE email=$1',
                values: [userEmail, customerId, newExpirationDate],
            };
            (0, db_1.queryDB)(updateMembershipStatusQuery, (err, result) => {
                if (err) {
                    console.error("Database query error", err);
                }
                if (result.rowCount === 0) {
                    console.error("No user found with the given email");
                }
            });
        }
        else if (event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object;
            console.log("Invoice payment was successful:", invoice.id);
            const userEmail = invoice.customer_email;
            const customerId = invoice.customer;
            const subscription = yield stripe.subscriptions.retrieve(event.data.object.subscription);
            const newExpirationDate = new Date(subscription.current_period_end * 1000);
            newExpirationDate.setHours(newExpirationDate.getHours() + 1);
            const updateMembershipStatusQuery = {
                text: 'UPDATE "Freemind".users SET stripe_customer_id=$2, access_expiration=$3 WHERE email=$1',
                values: [userEmail, customerId, newExpirationDate],
            };
            (0, db_1.queryDB)(updateMembershipStatusQuery, (err, result) => {
                if (err) {
                    console.error("Database query error", err);
                }
                if (result.rowCount === 0) {
                    console.error("No user found with the given email");
                }
            });
        }
        else if (event.type === "invoice.payment_failed") {
            const invoice = event.data.object;
            console.log("Invoice payment failed:", invoice.id);
            return res.sendStatus(401);
        }
        return res.sendStatus(200);
    });
}
exports.webhookHandler = webhookHandler;
//# sourceMappingURL=webhook.js.map