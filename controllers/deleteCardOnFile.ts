import { Request, Response } from "express";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function deleteCardOnFile(req: Request, res: Response) {
  try {
    const { cardId } = req.body;
    await stripe.paymentMethods.detach(cardId);
    return res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to delete card");
  }
}

export { deleteCardOnFile };
