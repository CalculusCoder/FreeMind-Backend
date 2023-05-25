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
exports.getCustomerPayment = void 0;
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
function getCustomerPayment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { stripeCustomerId } = req.params;
            const customer = yield stripe.customers.retrieve(stripeCustomerId);
            if (!customer.invoice_settings.default_payment_method) {
                return res.status(404).send("No default payment method found");
            }
            const defaultPaymentMethod = yield stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method);
            const paymentMethods = yield stripe.paymentMethods.list({
                customer: stripeCustomerId,
                type: "card",
            });
            const paymentDetails = paymentMethods.data.map((method) => ({
                id: method.id,
                brand: method.card.brand,
                last4: method.card.last4,
                default: method.id === defaultPaymentMethod.id,
            }));
            res.json(paymentDetails);
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Failed to retrieve payment methods");
        }
    });
}
exports.getCustomerPayment = getCustomerPayment;
//# sourceMappingURL=getCustomerPayment.js.map