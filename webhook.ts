import { Response } from "express";
import { ExtendedRequest } from "./types";
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "./configuration/config";
import { queryDB } from "./db/db";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51N2mV6EmHzDZeH6XTSPQBXH7EfYoEP5AbkWpPrShqfdnUBIWnMUMevMYpwtFDJb38yvzNbyloxhyWrDcn0qz1pG200b4X2ShKF"
);

async function webhookHandler(req: ExtendedRequest, res: Response) {
  const stripeSignature = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      stripeSignature,
      "whsec_cD2Z0ZYpDGD1qeEVDlR2jRzDQNBRYzTs"
    );
  } catch (err) {
    console.log(`Error: ${err}`);
    return res.status(400).send(`Webhook error: ${err}`);
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    console.log("Invoice payment was successful:", invoice.id);

    const userEmail = invoice.customer_email;

    const updateMembershipStatusQuery = {
      text: 'UPDATE "Freemind".users SET ismember=true WHERE email=$1',
      values: [userEmail],
    };

    queryDB(updateMembershipStatusQuery, (err: Error, result: QueryResult) => {
      if (err) {
        console.error("Database query error", err);
      }

      if (result.rowCount === 0) {
        console.error("No user found with the given email");
      }
    });
  } else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    console.log("Invoice payment failed:", invoice.id);
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    console.log("Subscription was cancelled:", subscription.id);

    const customerId = subscription.customer;

    // Fetch customer details
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;

    // Set isMember to false in the database
    const updateMembershipStatusQuery = {
      text: 'UPDATE "Freemind".users SET ismember=false WHERE email=$1',
      values: [userEmail],
    };

    queryDB(updateMembershipStatusQuery, (err: Error, result: QueryResult) => {
      if (err) {
        console.error("Database query error", err);
      }

      if (result.rowCount === 0) {
        console.error("No user found with the given email");
      }
    });
  }

  res.sendStatus(200);
}

export { webhookHandler };
