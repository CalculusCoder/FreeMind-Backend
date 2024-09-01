import { Request, Response } from "express";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getCustomerPayment(req: Request, res: Response) {
  try {
    const { stripeCustomerId } = req.params;

    const customer = await stripe.customers.retrieve(stripeCustomerId);

    if (!customer.invoice_settings.default_payment_method) {
      return res.status(404).send("No default payment method found");
    }

    const defaultPaymentMethod = await stripe.paymentMethods.retrieve(
      customer.invoice_settings.default_payment_method as string
    );

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    const paymentDetails = paymentMethods.data.map((method: any) => ({
      id: method.id,
      brand: method.card.brand,
      last4: method.card.last4,
      default: method.id === defaultPaymentMethod.id,
    }));

    res.json(paymentDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to retrieve payment methods");
  }
}

export { getCustomerPayment };
