import { Request, Response } from "express";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setDefaultCard(req: Request, res: Response) {
  try {
    const { cardId, customerId } = req.body;
    console.log(req.body);

    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: cardId,
      },
    });

    return res
      .status(200)
      .json({ message: "Default card updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to update default card.");
  }
}

export { setDefaultCard };
