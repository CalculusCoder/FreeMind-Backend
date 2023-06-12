import { Response } from "express";
import { ExtendedRequest } from "./types";
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "./configuration/config";
import { queryDB } from "./db/db";
import nodemailer from "nodemailer";
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD
  }
})

async function sendReceiptEmail(userEmail: string, receipt: any) {
  const filePath = path.join(__dirname, '/views/receipt.ejs');
  const compiled = ejs.compile(fs.readFileSync(filePath, 'utf8'));

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: userEmail,
    subject: 'Your Receipt',
    html: compiled({ receipt: receipt }) // pass data to template
  };

  return transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
}


async function webhookHandler(req: ExtendedRequest, res: Response) {
  const stripeSignature = req.headers["stripe-signature"] as string;
  let event;

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

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("PaymentIntent was successful:", paymentIntent.id);
  } else if (event.type === "customer.subscription.created") {
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

    queryDB(updateMembershipStatusQuery, (err: Error, result: QueryResult) => {
      if (err) {
        console.error("Database query error", err);
      }

      if (result.rowCount === 0) {
        console.error("No user found with the given email");
      }
    });
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    console.log("Invoice payment was successful:", invoice.id);

    const userEmail = invoice.customer_email;
    const customerId = invoice.customer;

    const subscription = await stripe.subscriptions.retrieve(
      event.data.object.subscription
    );
    const newExpirationDate = new Date(subscription.current_period_end * 1000);
newExpirationDate.setHours(newExpirationDate.getHours() + 1);


    const updateMembershipStatusQuery = {
      text: 'UPDATE "Freemind".users SET stripe_customer_id=$2, access_expiration=$3 WHERE email=$1',
      values: [userEmail, customerId, newExpirationDate],
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
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
}

export { webhookHandler };
