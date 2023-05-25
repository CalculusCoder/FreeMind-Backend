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
exports.paymentHandler = void 0;
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
function paymentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, plan, userEmail } = req.body;
        if (!userEmail) {
            return res.sendStatus(403);
        }
        try {
            // Check if the customer already exists
            const customers = yield stripe.customers.list({ email: userEmail });
            let customerId;
            if (customers.data.length === 0) {
                // Create a new customer if not found
                const customer = yield stripe.customers.create({
                    email: userEmail,
                    payment_method: id,
                    invoice_settings: {
                        default_payment_method: id,
                    },
                });
                customerId = customer.id;
            }
            else {
                customerId = customers.data[0].id;
                // Attach the payment method to the customer
                yield stripe.paymentMethods.attach(id, { customer: customerId });
                // Update the customer's default payment method
                yield stripe.customers.update(customerId, {
                    invoice_settings: {
                        default_payment_method: id,
                    },
                });
            }
            // Retrieve the customer's subscriptions
            const subscriptions = yield stripe.subscriptions.list({
                customer: customerId,
            });
            // Create a subscription for the customer
            const subscription = yield stripe.subscriptions.create({
                customer: customerId,
                items: [
                    {
                        price: plan, // Use the plan ID received from the frontend
                    },
                ],
                expand: ["latest_invoice.payment_intent"],
            });
            const paymentIntent = subscription.latest_invoice.payment_intent;
            if (paymentIntent.status === "requires_payment_method") {
                return res.status(400).json({
                    message: "Payment failed, please check your payment details and try again.",
                });
            }
            console.log("Subscription", subscription);
            res.json({
                message: "Subscription Successful",
            });
        }
        catch (error) {
            console.log("Error", error);
            return res.status(500).json({
                message: "Subscription Failed",
                error: error.message,
            });
        }
    });
}
exports.paymentHandler = paymentHandler;
//# sourceMappingURL=payment.js.map