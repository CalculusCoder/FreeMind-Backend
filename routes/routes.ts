export {};
import express from "express";
import { loginHandler } from "../controllers/signin";
import { registerHandler } from "../controllers/register";
import { paymentHandler } from "../controllers/payment";
import { webhookHandler } from "../webhook";
import { cancelSubscription } from "../controllers/cancel";
import { checkMembership } from "../controllers/check-membership";
const router = express.Router();

router.post("/Signin", loginHandler);
router.post("/Register", registerHandler);
router.post("/Payment", paymentHandler);
router.post("/CancelMembership", cancelSubscription);
router.post("/CheckMembership", checkMembership);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

export { router };
