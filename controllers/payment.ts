import { Response } from "express";
import { ExtendedRequest } from "../types";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51N2mV6EmHzDZeH6XTSPQBXH7EfYoEP5AbkWpPrShqfdnUBIWnMUMevMYpwtFDJb38yvzNbyloxhyWrDcn0qz1pG200b4X2ShKF"
);

async function paymentHandler(req: ExtendedRequest, res: Response) {
  const { id, plan, userEmail } = req.body;

  if (!userEmail) {
    return res.sendStatus(403);
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

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(id, { customer: customerId });

      // Update the customer's default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: id,
        },
      });
    }

    // Retrieve the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

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

    const paymentIntent = subscription.latest_invoice.payment_intent;

    if (paymentIntent.status === "requires_payment_method") {
      return res.status(400).json({
        message:
          "Payment failed, please check your payment details and try again.",
      });
    }

    console.log("Subscription", subscription);
    res.json({
      message: "Subscription Successful",
    });
  } catch (error: any) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Subscription Failed",
      error: error.message,
    });
  }
}

export { paymentHandler };

// async function paymentHandler(req: ExtendedRequest, res: Response) {
//   const { id, plan, userEmail } = req.body;

//   if (!userEmail) {
//     res.sendStatus(403);
//     return;
//   }

//   try {
//     // Check if the customer already exists
//     const customers = await stripe.customers.list({ email: userEmail });
//     let customerId;

//     if (customers.data.length === 0) {
//       // Create a new customer if not found
//       const customer = await stripe.customers.create({
//         email: userEmail,
//         payment_method: id,
//         invoice_settings: {
//           default_payment_method: id,
//         },
//       });

//       customerId = customer.id;
//     } else {
//       customerId = customers.data[0].id;

//       // Update the customer's default payment method
//       await stripe.customers.update(customerId, {
//         invoice_settings: {
//           default_payment_method: id,
//         },
//       });
//     }

//     // Create a subscription for the customer
//     const subscription = await stripe.subscriptions.create({
//       customer: customerId,
//       items: [
//         {
//           price: plan, // Use the plan ID received from the frontend
//         },
//       ],
//       expand: ["latest_invoice.payment_intent"],
//     });

//     console.log("Subscription", subscription);
//     res.json({
//       message: "Subscription Successful",
//     });
//   } catch (error) {
//     console.log("Error", error);
//     res.json({
//       message: "Subscription Failed",
//     });
//   }
// }

// export { paymentHandler };
