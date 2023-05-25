import { Request, Response } from "express";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function updatePaymentMethod(req: Request, res: Response) {
  try {
    const { paymentMethodId, customerId } = req.body;

    // attach payment id to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // set as default payment method
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return res
      .status(200)
      .json({ message: "Payment method updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to update payment method.");
  }
}

export { updatePaymentMethod };
