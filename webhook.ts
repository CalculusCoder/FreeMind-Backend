import { Response } from "express";
import { ExtendedRequest } from "./types";
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "./configuration/config";
import { queryDB } from "./db/db";
import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import sgMail from "@sendgrid/mail";

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not defined");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendReceiptEmail(userEmail: string, receipt: any) {
  const filePath = path.join(__dirname, "views/receipt.ejs");

  //Read EJS file and compile
  const compiled = ejs.compile(fs.readFileSync(filePath, "utf8"));

  if (!process.env.GOOGLE_EMAIL) {
    throw new Error("EMAIL_USERNAME is not defined");
  }

  const msg = {
    to: userEmail,
    from: process.env.GOOGLE_EMAIL,
    subject: "Your Receipt",
    html: compiled({ receipt: receipt }),
  };

  return sgMail
    .send(msg)
    .then(() => console.log("Email sent"))
    .catch((error) => console.log(error.message));
}

//WebHook Handler

async function webhookHandler(req: ExtendedRequest, res: Response) {
  const stripeSignature = req.headers["stripe-signature"] as string;
  let event;

  //Construct Webhook Event
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SIGNATURE
    );
  } catch (err) {
    console.log(`Error: ${err}`);
    return res.status(400).send(`Webhook error: ${err}`);
  }

  //If payment succeeds
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("PaymentIntent was successful:", paymentIntent.id);
  }
  //IF User is first time customer
  else if (event.type === "customer.subscription.created") {
    const subscription = event.data.object;
    console.log("Subscription created:", subscription.id);

    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const userEmail = customer.email;
    const newExpirationDate = new Date(subscription.current_period_end * 1000);
    newExpirationDate.setHours(newExpirationDate.getHours() + 1);

    const updateMembershipStatusQuery = {
      text: 'UPDATE "Freemind".users stripe_customer_id=$2, access_expiration=$3 WHERE email=$1',
      values: [userEmail, customerId, newExpirationDate],
    };

    try {
      const result = await queryDB(updateMembershipStatusQuery);
      if (result.rowCount === 0) {
        console.error("No user found with the given email");
      }
    } catch (err) {
      console.error("Database query error", err);
    }
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    console.log("Invoice payment was successful:", invoice.id);

    const userEmail = invoice.customer_email;
    const customerId = invoice.customer;

    sendReceiptEmail(userEmail, invoice);

    //IF user is not first time customer and is renewing subscription,
    //Create new expiration date and update DB

    const subscription = await stripe.subscriptions.retrieve(
      event.data.object.subscription
    );
    const newExpirationDate = new Date(subscription.current_period_end * 1000);
    newExpirationDate.setHours(newExpirationDate.getHours() + 1);

    const updateMembershipStatusQuery = {
      text: 'UPDATE "Freemind".users SET stripe_customer_id=$2, access_expiration=$3 WHERE email=$1',
      values: [userEmail, customerId, newExpirationDate],
    };

    try {
      const result = await queryDB(updateMembershipStatusQuery);
      if (result.rowCount === 0) {
        console.error("No user found with the given email");
      }
    } catch (err) {
      console.error("Database query error", err);
    }
  }
  //If invoice payment failed
  else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    console.log("Invoice payment failed:", invoice.id);
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
}

export { webhookHandler };
