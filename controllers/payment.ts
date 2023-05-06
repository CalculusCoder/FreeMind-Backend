import { Response } from "express";
import { ExtendedRequest } from "../types";
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
  const { id, plan } = req.body;
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
    // Check if the customer already exists
    const customers = await stripe.customers.list({ email: userEmail });
    let customerId;

    if (customers.data.length === 0) {
      // Create a new customer if not found
      const customer = await stripe.customers.create({
        email: userEmail,
        payment_method: id,
        invoice_settings: {
          default_payment_method: id,
        },
      });

      customerId = customer.id;
    } else {
      customerId = customers.data[0].id;

      // Update the customer's default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: id,
        },
      });
    }

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: plan, // Use the plan ID received from the frontend
        },
      ],
      expand: ["latest_invoice.payment_intent"],
    });

    console.log("Subscription", subscription);
    res.json({
      message: "Subscription Successful",
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Subscription Failed",
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
