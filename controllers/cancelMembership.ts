import { Request, Response } from "express";

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function cancelSubscription(req: Request, res: Response) {
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
    await stripe.subscriptions.del(subscription.id);
    console.log("Subscription  cancelled !!!");
    return res
      .status(200)
      .json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to cancel the subscription" });
  }
}

export { cancelSubscription };
