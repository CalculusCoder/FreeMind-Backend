import { Request, Response } from "express";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getSubscriptionStatus(req: Request, res: Response) {
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.sendStatus(400);
  }

  try {
    // Retrieve the customer by email
    const customers = await stripe.customers.list({ email: userEmail });

    if (customers.data.length === 0) {
      return res.status(403).json({ message: "Customer not found" });
    }

    const customerId = customers.data[0].id;

    // Retrieve the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ message: "No active subscriptions" });
    }

    const subscription = subscriptions.data[0];

    // Return the subscription status
    return res.status(200).json({ status: subscription.status });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch subscription status" });
  }
}

export { getSubscriptionStatus };
