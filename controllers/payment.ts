import { Request, Response } from "express";
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "../configuration/config";
import { queryDB } from "../db/db";

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51N2mV6EmHzDZeH6XTSPQBXH7EfYoEP5AbkWpPrShqfdnUBIWnMUMevMYpwtFDJb38yvzNbyloxhyWrDcn0qz1pG200b4X2ShKF"
);

async function paymentHandler(req: Request, res: Response) {
  let { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "FreeMind Membership",
      payment_method: id,
      confirm: true,
    });
    console.log("Payment", payment);
    res.json({
      message: "Payment Successful",
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment Failed",
    });
  }
}

export { paymentHandler };
