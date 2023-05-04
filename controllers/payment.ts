import { Response } from "express";
import { ExtendedRequest } from "../types";
import { Pool, QueryResult, QueryConfig } from "pg";
import { db } from "../configuration/config";
import { queryDB } from "../db/db";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51N2mV6EmHzDZeH6XTSPQBXH7EfYoEP5AbkWpPrShqfdnUBIWnMUMevMYpwtFDJb38yvzNbyloxhyWrDcn0qz1pG200b4X2ShKF"
);

async function verifyJwtToken(
  token: string,
  secretOrPublicKey: string
): Promise<JwtPayload> {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JwtPayload);
      }
    });
  });
}

async function paymentHandler(req: ExtendedRequest, res: Response) {
  let { amount, id } = req.body;
  let userEmail;

  if (!req.token) {
    res.sendStatus(403);
    return;
  }

  try {
    const authData = await verifyJwtToken(req.token as string, "jwtsecret3101");

    if (authData && authData.email) {
      userEmail = authData.email;
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(403);
  }

  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "FreeMind Membership",
      payment_method: id,
      confirm: true,
    });

    const updateMembershipStatusQuery = {
      text: 'UPDATE "Freemind".users SET ismember=true WHERE email=$1',
      values: [userEmail],
    };

    queryDB(updateMembershipStatusQuery, (err: Error, result: QueryResult) => {
      if (err) {
        console.error("Database query error", err);
        return res
          .status(500)
          .json({ error: "Failed to update membership status" });
      }

      if (result.rowCount === 0) {
        console.error("No user found with the given email");
        return res.status(404).json({ error: "User not found" });
      }

      console.log("Payment", payment);
      res.json({
        message: "Payment Successful",
      });
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment Failed",
    });
  }
}

export { paymentHandler };

// if (!token) {
//   return res.status(401).json({ message: "No token provided" });
// }

// let userEmail: string;
// try {
//   const decoded = jwt.verify(
//     token,
//     process.env.JWT_SECRET || "jwtsecret3101"
//   ) as JwtPayload;
//   userEmail = decoded.email;
// } catch (error) {
//   return res.status(401).json({ message: "Invalid token" });
// }
